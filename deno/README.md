# Goldmark

A very fast Markdown compiler for Deno 🦕

Powered by Go's [Goldmark](https://github.com/yuin/goldmark) compiled to WASM.

## Usage

### Basic Example

```ts
import { init, transform } from "https://deno.land/x/goldmark/mod.ts";

await init();
const markdown = await Deno.readTextFile(new URL('./content.md', import.meta.url));
const { frontmatter, content } = await transform(markdown, {
    render: {
        unsafeHTML: true
    },
    extensions: {
        GFM: true,
        typographer: true,
    }
})

console.log(frontmatter);
console.log(content);
```

## Performance

Runs come in well under `1ms` on average. See [`bench/mod.ts`](https://github.com/natemoo-re/goldmark/blob/main/bench/mod.ts).

Sampling **100,000** runs completed in `58s` with an average run of `0.57ms`.

