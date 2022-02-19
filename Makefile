version = patch
# Strip debug info
GO_FLAGS += "-ldflags=-s -w"

# Avoid embedding the build path in the executable for more reproducible builds
GO_FLAGS += -trimpath

wasm: cmd/goldmark/*.go go.mod
	CGO_ENABLED=0 GOOS=js GOARCH=wasm go build $(GO_FLAGS) -o ./deno/goldmark.wasm ./cmd/goldmark/goldmark.go
	cp ./deno/goldmark.wasm ./node/goldmark.wasm

inline:
	deno run --allow-read --allow-write build.ts
	node build.mjs

release:
	make wasm
	make inline
	git add --force ./deno/goldmark_wasm.js
	git add --force ./node/goldmark_wasm.mjs
	git commit -m "release $(version)" --allow-empty
	git push

bench-deno:
	deno run --allow-read --allow-write ./bench/mod.ts

bench-node:
	node ./bench/mod.mjs

clean:
	git clean -dxf
