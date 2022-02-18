// File adapted from https://deno.land/x/brotli@v0.1.4/scripts/build.ts
// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { readFile, writeFile } from 'fs/promises';
import { compress } from 'lz4-napi';

const encoder = new TextEncoder('utf-8');
const wasm = await readFile('./node/goldmark.wasm');
const compressed = await compress(wasm)
const encoded = compressed.toString('base64');

const source = `import { uncompress } from "lz4-napi";
export const source = await uncompress(Buffer.from("${encoded}", "base64"));`;

await writeFile("./node/goldmark_wasm.mjs", encoder.encode(source));
