# Goldmark

A very fast Markdown compiler for Deno 🦕

Powered by Go's [Goldmark](https://github.com/yuin/goldmark) compiled to WASM.

## Usage

### Basic Example

```ts
import { transform } from "https://deno.land/x/goldmark/mod.ts";

const markdown = await Deno.readTextFile(new URL('./content.md', import.meta.url));
const { frontmatter, code } = await transform(markdown)

console.log(frontmatter);
console.log(code);
```

## Performance

The initial run of `transform` may take somewhere between `500ms` and `1s`, because it needs to fetch the WASM module.
Subsequent runs come in under `1ms` on average. See [`bench/mod.ts`](https://github.com/natemoo-re/goldmark/blob/main/bench/mod.ts).
