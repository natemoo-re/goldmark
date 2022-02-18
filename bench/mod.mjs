import { init, transform, kill } from "../node/index.mjs";
import { readFile } from 'fs/promises';

async function run() {
  const runs = 50;
  const times = [];
  const content = await readFile(new URL('./content.md', import.meta.url)).then(res => res.toString());

  await init();
  const start = performance.now();
  
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    console.log(`${i} start`)
    await transform(content)
    console.log(`${i} end`)
    const end = performance.now();
    times.push(end - start)
  }

  const end = performance.now();
  const duration = end - start;
  const avg = times.reduce((avg, ent) => avg + ent, 0) / runs;
  console.log(`\nCompleted ${runs} runs in ${duration}ms`);
  console.log(`Average run ${Math.floor(avg * 100) / 100}ms`)
}

run().then(() => kill());
