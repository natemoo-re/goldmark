// +build js,wasm
package main

import (
	"bytes"
	"syscall/js"

	"github.com/norunners/vert"
	"github.com/yuin/goldmark"
	meta "github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

func main() {
	js.Global().Set("__goldmark_transform", js.FuncOf(Transform))
	<-make(chan bool)
}

func jsString(j js.Value) string {
	if j.IsUndefined() || j.IsNull() {
		return ""
	}
	return j.String()
}

type TransformResult struct {
	Code        string                 `js:"code"`
	Frontmatter map[string]interface{} `js:"frontmatter"`
}

func Transform(this js.Value, args []js.Value) interface{} {
	source := jsString(args[0])

	markdown := goldmark.New(
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithXHTML(),
			html.WithUnsafe(),
		),
		goldmark.WithExtensions(
			extension.GFM,
			meta.Meta,
		),
	)

	var buf bytes.Buffer
	context := parser.NewContext()
	if err := markdown.Convert([]byte(source), &buf, parser.WithContext(context)); err != nil {
		panic(err)
	}
	frontmatter := meta.Get(context)

	return vert.ValueOf(TransformResult{
		Frontmatter: frontmatter,
		Code:        buf.String(),
	})
}
