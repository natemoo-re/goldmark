// File adapted from https://deno.land/x/brotli@v0.1.4/scripts/build.ts
// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { encode } from "https://deno.land/std@0.102.0/encoding/base64.ts";
import { compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";
import * as Terser from "https://esm.sh/terser@5.7.1";

const encoder = new TextEncoder();
const wasm = await Deno.readFile(`deno/goldmark.wasm`);
const compressed = compress(wasm);
const encoded = encode(compressed);

const source = `import * as lz4 from "https://deno.land/x/lz4@v0.1.2/mod.ts";
                export const source = lz4.decompress(Uint8Array.from(atob("${encoded}"), c => c.charCodeAt(0)));`;

const output = await Terser.minify(`${source}`, {
  mangle: { module: true },
  output: {
    preamble: "//deno-fmt-ignore-file",
  },
});

await Deno.writeFile("deno/goldmark_wasm.js", encoder.encode(output.code));
