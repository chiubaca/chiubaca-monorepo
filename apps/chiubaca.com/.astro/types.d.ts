declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"permanent-notes": {
"all-things-vector-tiles.md": {
	id: "all-things-vector-tiles.md";
  slug: "all-things-vector-tiles";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"anatomy-of-a-threejs-scene.md": {
	id: "anatomy-of-a-threejs-scene.md";
  slug: "anatomy-of-a-threejs-scene";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"auto-js-sdk-for-any-rest-api.md": {
	id: "auto-js-sdk-for-any-rest-api.md";
  slug: "auto-js-sdk-for-any-rest-api";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"build-a-serverless-crud-app-using-vue-js-netlify-and-faunadb.md": {
	id: "build-a-serverless-crud-app-using-vue-js-netlify-and-faunadb.md";
  slug: "build-a-serverless-crud-app-using-vue-js-netlify-and-faunadb";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"business-ideas.md": {
	id: "business-ideas.md";
  slug: "business-ideas";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"controlling-my-anxiety-insomnia.md": {
	id: "controlling-my-anxiety-insomnia.md";
  slug: "controlling-my-anxiety-insomnia";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"docker-commands-cheatsheet.md": {
	id: "docker-commands-cheatsheet.md";
  slug: "docker-commands-cheatsheet";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"holograpic-cards-soft-spotlight.md": {
	id: "holograpic-cards-soft-spotlight.md";
  slug: "holograpic-cards-soft-spotlight";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"how-use-npm-modules-client-side-in-astrojs.md": {
	id: "how-use-npm-modules-client-side-in-astrojs.md";
  slug: "how-use-npm-modules-client-side-in-astrojs";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"making-eco-friendly-websites.md": {
	id: "making-eco-friendly-websites.md";
  slug: "making-eco-friendly-websites";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"managing-your-self-learning.md": {
	id: "managing-your-self-learning.md";
  slug: "managing-your-self-learning";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"must-have-mac-apps.md": {
	id: "must-have-mac-apps.md";
  slug: "must-have-mac-apps";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"nx-for-noobs.md": {
	id: "nx-for-noobs.md";
  slug: "nx-for-noobs";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"principles-for-using-ai-to-write-code.md": {
	id: "principles-for-using-ai-to-write-code.md";
  slug: "principles-for-using-ai-to-write-code";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"quick-look-at-react-use-hook.md": {
	id: "quick-look-at-react-use-hook.md";
  slug: "quick-look-at-react-use-hook";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"remix-basics.md": {
	id: "remix-basics.md";
  slug: "remix-basics";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"resources.md": {
	id: "resources.md";
  slug: "resources";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"shiba-every-hour-a-twitter-bot-powered-by-github-actions.md": {
	id: "shiba-every-hour-a-twitter-bot-powered-by-github-actions.md";
  slug: "shiba-every-hour-a-twitter-bot-powered-by-github-actions";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"svelte-basics.md": {
	id: "svelte-basics.md";
  slug: "svelte-basics";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"swapping-react-for-preact-in-nextjs.md": {
	id: "swapping-react-for-preact-in-nextjs.md";
  slug: "swapping-react-for-preact-in-nextjs";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"typescript-and-netlify-functions.md": {
	id: "typescript-and-netlify-functions.md";
  slug: "typescript-and-netlify-functions";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"using-javascript-to-write-postgresql-functions.md": {
	id: "using-javascript-to-write-postgresql-functions.md";
  slug: "using-javascript-to-write-postgresql-functions";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
"zettelkasten-smart-notes-step-by-step-with-obsidian.md": {
	id: "zettelkasten-smart-notes-step-by-step-with-obsidian.md";
  slug: "zettelkasten-smart-notes-step-by-step-with-obsidian";
  body: string;
  collection: "permanent-notes";
  data: InferEntrySchema<"permanent-notes">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
