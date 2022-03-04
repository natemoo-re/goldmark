import ms from 'ms';
import { init, transform, kill } from "../../node/index.mjs";
import { readFile } from 'fs/promises';
import { performance } from 'perf_hooks';

async function run() {
  console.log('');
  console.log('---');
  console.log('🚀 Benchmarking Node')
  const initStart = performance.now();
  await init();
  const initEnd = performance.now();
  console.log(`⚡️ Initialized in ${ms(initEnd - initStart)}`);
  const runs = 5000;
  const times = [];
  const content = await readFile(new URL('./content.md', import.meta.url)).then(res => res.toString());
  
  const start = performance.now();
  console.log(`🤖 Sampling ${runs} runs...`);
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const result = await transform(content)
    const end = performance.now();
    times.push(end - start)
  }

  const end = performance.now();
  const duration = end - start;
  const avg = times.reduce((avg, ent) => avg + ent, 0) / runs;
  console.log(`🤖 Sampling completed in ${ms(duration)}`);
  console.log('');
  console.log(`📚 Average run was ${ms(Math.floor(avg * 100) / 100)}`)
  console.log('---');
  console.log('');
}

run().then(() => kill());
