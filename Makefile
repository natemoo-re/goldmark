version = patch
# Strip debug info
GO_FLAGS += "-ldflags=-s -w"

# Avoid embedding the build path in the executable for more reproducible builds
GO_FLAGS += -trimpath

wasm: cmd/goldmark/*.go go.mod
	CGO_ENABLED=0 GOOS=js GOARCH=wasm go build $(GO_FLAGS) -o ./deno/goldmark.wasm ./cmd/goldmark/goldmark.go

inline:
	deno run --allow-read --allow-write build.ts

release:
	make wasm
	make inline
	git add --force ./deno/goldmark_wasm.js
	git commit -m "release $(version)" --allow-empty
	git push

clean:
	git clean -dxf
