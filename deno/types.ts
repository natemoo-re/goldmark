export interface TransformOptions {
  sourcefile?: string;
}

export interface TransformResult {
	code: string;
	frontmatter: Record<string|number, unknown>|null;
}

export declare function transform(input: string, options?: TransformOptions): Promise<TransformResult>;
