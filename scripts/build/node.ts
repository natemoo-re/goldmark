// File adapted from https://deno.land/x/brotli@v0.1.4/scripts/build.ts
// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { encode } from "https://deno.land/std@0.102.0/encoding/base64.ts";
import { gzip } from "https://deno.land/x/denoflate/mod.ts";
import * as Terser from "https://esm.sh/terser@5.7.1";

const encoder = new TextEncoder();
const wasm = await Deno.readFile(`node/goldmark.wasm`);
const compressed = gzip(wasm, undefined);
const encoded = encode(compressed);
const source = `import { decompressSync } from 'fflate';
export const source = decompressSync(Uint8Array.from(Buffer.from("${encoded}", "base64")));`;

const output = await Terser.minify(`${source}`, {
  mangle: { module: true }
});

await Deno.writeFile("node/goldmark_wasm.mjs", encoder.encode(output.code));
