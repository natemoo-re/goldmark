# Goldmark

A very fast Markdown compiler for Deno 🦕

Powered by Go's [Goldmark](https://github.com/yuin/goldmark) compiled to WASM.

## Usage

### Basic Example

```ts
import { transform } from "https://deno.land/x/goldmark/mod.ts";

const markdown = await Deno.readTextFile('./content.md');
const { frontmatter, content } = await transform(markdown)

console.log(frontmatter);
console.log(content);
```
