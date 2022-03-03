version = patch
# Strip debug info
GO_FLAGS += "-ldflags=-s -w"

# Avoid embedding the build path in the executable for more reproducible builds
GO_FLAGS += -trimpath

wasm: cmd/goldmark/*.go go.mod
	CGO_ENABLED=0 GOOS=js GOARCH=wasm go build $(GO_FLAGS) -o ./deno/goldmark.wasm ./cmd/goldmark/goldmark.go
	cp ./deno/goldmark.wasm ./node/goldmark.wasm

inline:
	deno run --allow-read --allow-write scripts/build/deno.ts
	deno run --allow-read --allow-write scripts/build/node.ts

build:
	make wasm
	make inline

bench:
	make bench-deno
	make bench-node

bench-deno:
	deno run --allow-read --allow-write scripts/bench/deno.ts

bench-node:
	node scripts/bench/node.mjs

release:
	make build
	cd node && npm --no-git-tag-version version $(version)
	git add --force ./deno/goldmark_wasm.js ./node/goldmark_wasm.mjs ./node/package.json
	git commit -m "release $(version)" --allow-empty
	git push

clean:
	git clean -dxf
