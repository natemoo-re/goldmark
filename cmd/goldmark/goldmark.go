//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"encoding/json"
	"syscall/js"

	"github.com/yuin/goldmark"
	meta "github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/renderer/html"
)

func main() {
	js.Global().Set("goldmark", js.ValueOf(make(map[string]interface{})))
	module := js.Global().Get("goldmark")
	module.Set("transform", js.FuncOf(Transform))
	<-make(chan struct{})
}

func jsString(j js.Value) string {
	if j.IsUndefined() || j.IsNull() {
		return ""
	}
	return j.String()
}

type TransformOptions struct {
	Extensions Extensions
	Render     Render
}

type Render struct {
	HardWrap   bool
	XHTML      bool
	UnsafeHTML bool
}

type Extensions struct {
	Frontmatter    bool
	AutoHeadingID  bool
	Autolinks      bool
	Attributes     bool
	Table          bool
	Strikethrough  bool
	TaskList       bool
	GFM            bool
	DefinitionList bool
	Footnote       bool
	Typographer    bool
}

type TransformResult struct {
	Content     string                 `json:"content"`
	Frontmatter map[string]interface{} `json:"frontmatter"`
}

func makeRender(renderOptions js.Value) Render {
	return Render{
		HardWrap:   renderOptions.Get("hardWrap").Bool(),
		XHTML:      renderOptions.Get("XHTML").Bool(),
		UnsafeHTML: renderOptions.Get("unsafeHTML").Bool(),
	}
}

func makeExtensions(extensions js.Value) Extensions {
	return Extensions{
		Attributes:     extensions.Get("attributes").Bool(),
		AutoHeadingID:  extensions.Get("autoHeadingID").Bool(),
		Autolinks:      extensions.Get("autolinks").Bool(),
		DefinitionList: extensions.Get("definitionList").Bool(),
		Footnote:       extensions.Get("footnote").Bool(),
		Frontmatter:    extensions.Get("frontmatter").Bool(),
		GFM:            extensions.Get("GFM").Bool(),
		Strikethrough:  extensions.Get("strikethrough").Bool(),
		Table:          extensions.Get("table").Bool(),
		TaskList:       extensions.Get("taskList").Bool(),
		Typographer:    extensions.Get("typographer").Bool(),
	}
}

func makeTransformOptions(options js.Value) TransformOptions {
	return TransformOptions{
		Render:     makeRender(options.Get("render")),
		Extensions: makeExtensions(options.Get("extensions")),
	}
}

func NewGoldmark(opts TransformOptions) goldmark.Markdown {
	parserOptions := make([]parser.Option, 0)
	renderOptions := make([]renderer.Option, 0)
	extensions := make([]goldmark.Extender, 0)

	if opts.Render.HardWrap {
		renderOptions = append(renderOptions, html.WithHardWraps())
	}
	if opts.Render.XHTML {
		renderOptions = append(renderOptions, html.WithXHTML())
	}
	if opts.Render.UnsafeHTML {
		renderOptions = append(renderOptions, html.WithUnsafe())
	}

	if opts.Extensions.Attributes {
		parserOptions = append(parserOptions, parser.WithAttribute())
	}
	if opts.Extensions.AutoHeadingID {
		parserOptions = append(parserOptions, parser.WithAutoHeadingID())
	}
	if opts.Extensions.Autolinks {
		extensions = append(extensions, extension.Linkify)
	}
	if opts.Extensions.DefinitionList {
		extensions = append(extensions, extension.DefinitionList)
	}
	if opts.Extensions.Footnote {
		extensions = append(extensions, extension.Footnote)
	}
	if opts.Extensions.Frontmatter {
		extensions = append(extensions, meta.Meta)
	}
	if opts.Extensions.GFM {
		extensions = append(extensions, extension.GFM)
	}
	if opts.Extensions.Strikethrough {
		extensions = append(extensions, extension.Strikethrough)
	}
	if opts.Extensions.Table {
		extensions = append(extensions, extension.Table)
	}
	if opts.Extensions.TaskList {
		extensions = append(extensions, extension.TaskList)
	}
	if opts.Extensions.Typographer {
		extensions = append(extensions, extension.Typographer)
	}
	return goldmark.New(
		goldmark.WithParserOptions(
			parserOptions...,
		),
		goldmark.WithRendererOptions(
			renderOptions...,
		),
		goldmark.WithExtensions(
			extensions...,
		),
	)
}

func Transform(this js.Value, args []js.Value) interface{} {
	source := jsString(args[0])
	opts := makeTransformOptions(args[1])
	markdown := NewGoldmark(opts)

	var buf bytes.Buffer
	context := parser.NewContext()
	if err := markdown.Convert([]byte(source), &buf, parser.WithContext(context)); err != nil {
		panic(err)
	}
	frontmatter := meta.Get(context)
	result := TransformResult{
		Frontmatter: frontmatter,
		Content:     buf.String(),
	}
	data, _ := json.Marshal(result)

	return js.ValueOf(string(data))
}
