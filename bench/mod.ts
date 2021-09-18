import { transform } from "https://deno.land/x/goldmark/mod.ts";

const runs = 5000;
const times: number[] = [];
const content = await Deno.readTextFile(new URL('./content.md', import.meta.url));

for (let i = 0; i < runs; i++) {
  const start = performance.now();
  await transform(content)
  const end = performance.now();
  times.push(end - start)
}

console.log(times[0])
console.log(times.slice(1).reduce((avg, ent) => avg + ent, 0) / runs)
