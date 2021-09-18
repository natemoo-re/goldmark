import { transform } from "./mod.ts";

const runs = 5000;
const times: number[] = [];
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  const result = await transform(`---
  hello: world
  ---
  # Hello {value.split('').reverse().join('')}!

  <Component value={ahhh}>

  ## Goodbye

  </Component>`)
  const end = performance.now();
  times.push(end - start)
}

console.log(times.reduce((avg, ent) => avg + ent, 0) / runs)
