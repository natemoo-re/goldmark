version = patch
# Strip debug info
GO_FLAGS += "-ldflags=-s -w"

# Avoid embedding the build path in the executable for more reproducible builds
GO_FLAGS += -trimpath

wasm: cmd/goldmark/*.go go.mod
	CGO_ENABLED=0 GOOS=js GOARCH=wasm go build $(GO_FLAGS) -o ./deno/goldmark.wasm ./cmd/goldmark/goldmark.go
	cp ./deno/goldmark.wasm ./node/goldmark.wasm

inline:
	deno run --unstable --allow-read --allow-write scripts/build/deno.ts
	deno run --unstable --allow-read --allow-write scripts/build/node.ts

build:
	make wasm
	make inline

bench-ci:
	deno run --unstable --allow-read --allow-write scripts/bench/deno.ts --ci > bench.txt
	node scripts/bench/node.mjs --ci >> bench.txt

bench:
	deno run --unstable --allow-read --allow-write scripts/bench/deno.ts
	node scripts/bench/node.mjs > bench-node.txt

bench-deno:
	deno run --unstable --allow-read --allow-write scripts/bench/deno.ts

bench-node:
	node scripts/bench/node.mjs > bench-node.txt

release:
	make build
	cd node && npm --no-git-tag-version version $(version)
	git add --force ./deno/goldmark_wasm.js ./node/goldmark_wasm.mjs ./node/package.json ./node/package-lock.json
	git commit -m "release $(version)" --allow-empty
	git push

clean:
	git clean -dxf
