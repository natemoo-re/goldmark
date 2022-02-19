// Why the weird child_process wrapper?
// We need to workaround https://github.com/nodejs/node/issues/36616
// and offer an explicit `kill()` hook
import { fork } from 'child_process';
import { fileURLToPath } from 'url';

export const init = () => getService().then((service) => service.init());
export const transform = (input, options) => getService().then((service) => service.transform(input, options));
export const kill = () => getService().then((service) => service.kill());

let longLivedService;
const getService = () => {
  if (!longLivedService) {
    longLivedService = startRunningService().catch((err) => {
      // Let the caller try again if this fails.
      longLivedService = void 0;
      // But still, throw the error back up the caller.
      throw err;
    });
  }
  return longLivedService;
};

const startRunningService = async () => {
  const worker = fork(fileURLToPath(new URL("./worker.mjs", import.meta.url)), [], { detached: true });
  await new Promise((resolve) => {
		worker.once('message', (type) => type === 'ready' ? resolve() : null)
	})
  let ids = 0;

  function done(id) {
    return new Promise(resolve => {
      function done(message) {
        if (id === message.id) {
          worker.off('message', done);
          return resolve(message.result);
        }
      }
      worker.on('message', done)
    })
  }

  return Promise.resolve({
    init: () => {
      const id = `init-${ids++}`;
      worker.send({ type: 'init', id });
      return done(id);
    },
    transform: (input, options) => {
      const id = `transform-${ids++}`;
      worker.send({ type: 'transform', input, options, id });
      return done(id);
    },
    kill: () => worker.kill()
  })
};
