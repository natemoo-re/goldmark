// Why the weird child_process wrapper?
// We need to workaround https://github.com/nodejs/node/issues/36616
// and offer an explicit `kill()` hook
import { fork } from 'child_process';

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

const startRunningService = () => {
  const worker = fork(new URL("./worker.mjs", import.meta.url), []);
  let ids = 0;

  function done(id) {
    return new Promise(resolve => {
      function done(message) {
        if (id === message.id) {
          return resolve(message.result);
        }
        worker.off('message', done);
      }
      worker.on('message', done)
    })
  }

  return Promise.resolve({
    init: async () => {
      const id = `init-${ids++}`;
      worker.send({ type: 'init', id });
      await done(id);
    },
    transform: async (input, options) => {
      const id = `transform-${ids++}`;
      worker.send({ type: 'transform', input, options, id });
      await done(id);
    },
    kill: () => worker.kill()
  })
};
