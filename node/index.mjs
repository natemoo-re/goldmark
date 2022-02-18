import Go from "./wasm_exec.mjs";
import { source } from './goldmark_wasm.mjs';

function makeTransformOptions(options = {}) {
  const { render = {}, extensions = {} } = options;
  const { hardWrap = false, XHTML = false, unsafeHTML = false } = render;
  const {
    frontmatter = true,
    attributes = false,
    autoHeadingID = false,
    autolinks = false,
    definitionList = false,
    footnote = false,
    GFM = false,
    strikethrough = false,
    table = false,
    taskList = false,
    typographer = false,
  } = extensions;
  return {
    render: {
      hardWrap, 
      XHTML,
      unsafeHTML
    },
    extensions: {
      attributes,
      autoHeadingID,
      autolinks,
      definitionList,
      footnote,
      frontmatter,
      GFM,
      strikethrough,
      table,
      taskList,
      typographer
    }
  }
}

export const transform = (input, options) => getService().then((service) => service.transform(input, makeTransformOptions(options)));


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

// Workaround for https://github.com/nodejs/node/issues/36616
const timerId = setInterval(() => {}, 60000);

const instantiateWASM = (importObject) => WebAssembly.instantiate(source, importObject).then((mod) => {
  clearInterval(timerId);
  return mod;
});

const startRunningService = () => {
  const go = new Go();
  return instantiateWASM(go.importObject).then((wasm) => {
    go.run(wasm.instance);
    const _service = globalThis.goldmark;
    return {
      transform: (input, options) => new Promise((resolve) => resolve(_service.transform(input, options || {}))),
    };
  });
};

export const init = getService();
