export interface RenderOptions {
	hardWrap?: boolean;
	XHTML?: boolean;
	unsafeHTML?: boolean;
}

export interface Extensions {
	attributes?: boolean;
	autoHeadingID?: boolean;
	autolinks?: boolean;
	definitionList?: boolean;
	footnote?: boolean;
	frontmatter?: boolean;
	GFM?: boolean;
	strikethrough?: boolean;
	table?: boolean;
	taskList?: boolean;
	typographer?: boolean;
}

export interface TransformOptions {
  render?: RenderOptions;
  extensions?: Extensions;
}

export interface TransformResult {
	content: string;
	frontmatter: Record<string|number, unknown>|null;
}

export declare function transform(input: string, options?: TransformOptions): Promise<TransformResult>;
