import { transform } from "./deno/mod.ts";

const runs = 100;
const times: number[] = [];
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  const result = await transform(`---
  hello: world
  ---
  # Hello world!`)
  const end = performance.now();
  times.push(end - start)
  console.log(result)
}

console.log(times.reduce((avg, ent) => avg + ent, 0) / runs)
