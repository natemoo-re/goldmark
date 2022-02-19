import type * as types from "./types.ts";
export * from "./types.ts";
import "./wasm_exec.js";
import { source } from "./goldmark_wasm.js";


function makeTransformOptions(options: types.TransformOptions = {}): Required<types.TransformOptions> {
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

export const init = () => getService();
export const transform: typeof types.transform = (input, options) => getService().then((service) => service.transform(input, makeTransformOptions(options)));

interface Service {
  transform: typeof types.transform;
}

let longLivedService: Promise<Service>|undefined;

const getService = (): Promise<Service> => {
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

const instantiateWASM = (importObject: Record<string, any>) => WebAssembly.instantiate(source, importObject)

const startRunningService = (): Promise<Service> => {
  const go = new (globalThis as any).Go();
  return instantiateWASM(go.importObject).then((wasm) => {
    go.run(wasm.instance);
    const _service: any = (globalThis as any).goldmark;
    return {
      transform: (input, options) => new Promise((resolve) => resolve(_service.transform(input, options || {}))),
    };
  });
};
