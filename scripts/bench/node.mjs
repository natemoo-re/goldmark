import ms from 'ms';
import { init, transform, kill } from "../../node/index.mjs";
import { readFile } from 'fs/promises';
import { performance } from 'perf_hooks';

const CI = process.argv.slice(2).includes('--ci');
const log = (a, b) => {
  if (a !== null && !CI) {
    console.log(a);
    return
  }
  if (b !== null) {
    console.log(b || a);
  }
};

async function run() {
  const runs = 5000;
  log('', null);
  log('---', null);
  log('🚀 Benchmarking Deno', `\n## ⬢ Node (x${runs})`)
  const initStart = performance.now();
  await init();
  const initEnd = performance.now();
  log(`⚡️ Initialized in ${ms(initEnd - initStart)}`, `- ✨ Init in ${ms(initEnd - initStart)}`);
  const times = [];
  const content = await readFile(new URL('./content.md', import.meta.url)).then(res => res.toString());
  
  const start = performance.now();
  log(`🤖 Sampling ${runs} runs...`, null);
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await transform(content)
    const end = performance.now();
    times.push(end - start)
  }

  const end = performance.now();
  const duration = end - start;
  const avg = times.reduce((avg, ent) => avg + ent, 0) / runs;
  log(`🤖 Sampling completed in ${ms(duration)}`, `- ✅ Completed in ${ms(duration)}`);
  log('', null);
  log(`📚 Average run was ${ms(Math.floor(avg * 100) / 100)}`, `- ⚡️ Average of **${ms(Math.floor(avg * 100) / 100)}**`)
  log('---', null);
  log('', null);
}

run().then(() => kill());
