import type * as types from "./types.ts";
export * from "./types.ts";
import "./wasm_exec.js";

const Go = (globalThis as any).Go;

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

export const init = async () => {
  await ensureServiceIsRunning();
}

export const transform: typeof types.transform = async (input, options) => {
  const service = await ensureServiceIsRunning();
  return await service.transform(input, makeTransformOptions(options));
};

interface Service {
  transform: typeof types.transform;
}

let longLivedService: Service | undefined;

const ensureServiceIsRunning = (): Promise<Service> => {
  if (longLivedService) return Promise.resolve(longLivedService);
  return startRunningService();
}

const instantiateWASM = async (
  wasmURL: URL,
  importObject: Record<string, any>
): Promise<WebAssembly.WebAssemblyInstantiatedSource> => {
  if (wasmURL.protocol.startsWith('file')) {
    const bytes = await Deno.readFile(wasmURL);
    return await WebAssembly.instantiate(bytes, importObject)
  } else {
      return await WebAssembly.instantiateStreaming(
      fetch(wasmURL),
      importObject
    );
  }
};

const startRunningService = async () => {
  const go = new Go();
  const wasm = await instantiateWASM(new URL('./goldmark.wasm', import.meta.url), go.importObject);
  go.run(wasm.instance);

  const apiKeys = new Set([
    'transform'
  ]);
  const service: any = Object.create(null);

  for (const key of apiKeys.values()) {
    const globalKey = `__goldmark_${key}`;
    service[key] = (globalThis as any)[globalKey];
    delete (globalThis as any)[globalKey];
  }

  longLivedService = {
    transform: (input, options) => new Promise((resolve) => resolve(service.transform(input, options || {})))
  };
  return longLivedService;
};
