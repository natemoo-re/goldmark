import ms from 'https://cdn.skypack.dev/ms';
import { init, transform } from "../deno/mod.ts";

await init();
const runs = 100000;
const times: number[] = [];
const content = await Deno.readTextFile(new URL('./content.md', import.meta.url));

const start = performance.now();
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  await transform(content)
  const end = performance.now();
  times.push(end - start)
}
const end = performance.now();
const duration = end - start;
const avg = times.reduce((avg, ent) => avg + ent, 0) / runs;
console.log(`\nCompleted ${runs} runs in ${ms(duration)}`);
console.log(`Average run ${ms(Math.floor(avg * 100) / 100)}`)
