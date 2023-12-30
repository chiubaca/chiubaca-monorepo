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
		"fleeting-notes": {
"2020-09-10.md": {
	id: "2020-09-10.md";
  slug: "2020-09-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-11.md": {
	id: "2020-09-11.md";
  slug: "2020-09-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-12.md": {
	id: "2020-09-12.md";
  slug: "2020-09-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-13.md": {
	id: "2020-09-13.md";
  slug: "2020-09-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-14.md": {
	id: "2020-09-14.md";
  slug: "2020-09-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-15.md": {
	id: "2020-09-15.md";
  slug: "2020-09-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-16.md": {
	id: "2020-09-16.md";
  slug: "2020-09-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-17.md": {
	id: "2020-09-17.md";
  slug: "2020-09-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-18.md": {
	id: "2020-09-18.md";
  slug: "2020-09-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-19.md": {
	id: "2020-09-19.md";
  slug: "2020-09-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-20.md": {
	id: "2020-09-20.md";
  slug: "2020-09-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-22.md": {
	id: "2020-09-22.md";
  slug: "2020-09-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-23.md": {
	id: "2020-09-23.md";
  slug: "2020-09-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-24.md": {
	id: "2020-09-24.md";
  slug: "2020-09-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-25.md": {
	id: "2020-09-25.md";
  slug: "2020-09-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-26.md": {
	id: "2020-09-26.md";
  slug: "2020-09-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-27.md": {
	id: "2020-09-27.md";
  slug: "2020-09-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-28.md": {
	id: "2020-09-28.md";
  slug: "2020-09-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-29.md": {
	id: "2020-09-29.md";
  slug: "2020-09-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-09-30.md": {
	id: "2020-09-30.md";
  slug: "2020-09-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-01.md": {
	id: "2020-10-01.md";
  slug: "2020-10-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-02.md": {
	id: "2020-10-02.md";
  slug: "2020-10-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-03.md": {
	id: "2020-10-03.md";
  slug: "2020-10-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-04.md": {
	id: "2020-10-04.md";
  slug: "2020-10-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-05.md": {
	id: "2020-10-05.md";
  slug: "2020-10-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-06.md": {
	id: "2020-10-06.md";
  slug: "2020-10-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-07.md": {
	id: "2020-10-07.md";
  slug: "2020-10-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-08.md": {
	id: "2020-10-08.md";
  slug: "2020-10-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-09.md": {
	id: "2020-10-09.md";
  slug: "2020-10-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-10.md": {
	id: "2020-10-10.md";
  slug: "2020-10-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-11.md": {
	id: "2020-10-11.md";
  slug: "2020-10-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-12.md": {
	id: "2020-10-12.md";
  slug: "2020-10-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-13.md": {
	id: "2020-10-13.md";
  slug: "2020-10-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-14.md": {
	id: "2020-10-14.md";
  slug: "2020-10-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-15.md": {
	id: "2020-10-15.md";
  slug: "2020-10-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-16.md": {
	id: "2020-10-16.md";
  slug: "2020-10-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-17.md": {
	id: "2020-10-17.md";
  slug: "2020-10-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-18.md": {
	id: "2020-10-18.md";
  slug: "2020-10-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-19.md": {
	id: "2020-10-19.md";
  slug: "2020-10-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-20.md": {
	id: "2020-10-20.md";
  slug: "2020-10-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-21.md": {
	id: "2020-10-21.md";
  slug: "2020-10-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-22.md": {
	id: "2020-10-22.md";
  slug: "2020-10-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-23.md": {
	id: "2020-10-23.md";
  slug: "2020-10-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-24.md": {
	id: "2020-10-24.md";
  slug: "2020-10-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-25.md": {
	id: "2020-10-25.md";
  slug: "2020-10-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-26.md": {
	id: "2020-10-26.md";
  slug: "2020-10-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-27.md": {
	id: "2020-10-27.md";
  slug: "2020-10-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-28.md": {
	id: "2020-10-28.md";
  slug: "2020-10-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-29.md": {
	id: "2020-10-29.md";
  slug: "2020-10-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-30.md": {
	id: "2020-10-30.md";
  slug: "2020-10-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-10-31.md": {
	id: "2020-10-31.md";
  slug: "2020-10-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-01.md": {
	id: "2020-11-01.md";
  slug: "2020-11-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-02.md": {
	id: "2020-11-02.md";
  slug: "2020-11-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-03.md": {
	id: "2020-11-03.md";
  slug: "2020-11-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-04.md": {
	id: "2020-11-04.md";
  slug: "2020-11-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-05.md": {
	id: "2020-11-05.md";
  slug: "2020-11-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-06.md": {
	id: "2020-11-06.md";
  slug: "2020-11-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-07.md": {
	id: "2020-11-07.md";
  slug: "2020-11-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-08.md": {
	id: "2020-11-08.md";
  slug: "2020-11-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-09.md": {
	id: "2020-11-09.md";
  slug: "2020-11-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-10.md": {
	id: "2020-11-10.md";
  slug: "2020-11-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-11.md": {
	id: "2020-11-11.md";
  slug: "2020-11-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-12.md": {
	id: "2020-11-12.md";
  slug: "2020-11-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-13.md": {
	id: "2020-11-13.md";
  slug: "2020-11-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-14.md": {
	id: "2020-11-14.md";
  slug: "2020-11-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-15.md": {
	id: "2020-11-15.md";
  slug: "2020-11-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-16.md": {
	id: "2020-11-16.md";
  slug: "2020-11-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-17.md": {
	id: "2020-11-17.md";
  slug: "2020-11-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-18.md": {
	id: "2020-11-18.md";
  slug: "2020-11-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-19.md": {
	id: "2020-11-19.md";
  slug: "2020-11-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-20.md": {
	id: "2020-11-20.md";
  slug: "2020-11-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-21.md": {
	id: "2020-11-21.md";
  slug: "2020-11-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-22.md": {
	id: "2020-11-22.md";
  slug: "2020-11-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-23.md": {
	id: "2020-11-23.md";
  slug: "2020-11-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-24.md": {
	id: "2020-11-24.md";
  slug: "2020-11-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-25.md": {
	id: "2020-11-25.md";
  slug: "2020-11-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-26.md": {
	id: "2020-11-26.md";
  slug: "2020-11-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-27.md": {
	id: "2020-11-27.md";
  slug: "2020-11-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-28.md": {
	id: "2020-11-28.md";
  slug: "2020-11-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-29.md": {
	id: "2020-11-29.md";
  slug: "2020-11-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-11-30.md": {
	id: "2020-11-30.md";
  slug: "2020-11-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-01.md": {
	id: "2020-12-01.md";
  slug: "2020-12-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-02.md": {
	id: "2020-12-02.md";
  slug: "2020-12-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-03.md": {
	id: "2020-12-03.md";
  slug: "2020-12-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-04.md": {
	id: "2020-12-04.md";
  slug: "2020-12-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-05.md": {
	id: "2020-12-05.md";
  slug: "2020-12-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-06.md": {
	id: "2020-12-06.md";
  slug: "2020-12-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-07.md": {
	id: "2020-12-07.md";
  slug: "2020-12-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-08.md": {
	id: "2020-12-08.md";
  slug: "2020-12-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-09.md": {
	id: "2020-12-09.md";
  slug: "2020-12-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-10.md": {
	id: "2020-12-10.md";
  slug: "2020-12-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-11.md": {
	id: "2020-12-11.md";
  slug: "2020-12-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-12.md": {
	id: "2020-12-12.md";
  slug: "2020-12-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-13.md": {
	id: "2020-12-13.md";
  slug: "2020-12-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-14.md": {
	id: "2020-12-14.md";
  slug: "2020-12-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-15.md": {
	id: "2020-12-15.md";
  slug: "2020-12-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-16.md": {
	id: "2020-12-16.md";
  slug: "2020-12-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-17.md": {
	id: "2020-12-17.md";
  slug: "2020-12-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-18.md": {
	id: "2020-12-18.md";
  slug: "2020-12-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-19.md": {
	id: "2020-12-19.md";
  slug: "2020-12-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-20.md": {
	id: "2020-12-20.md";
  slug: "2020-12-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-21.md": {
	id: "2020-12-21.md";
  slug: "2020-12-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-22.md": {
	id: "2020-12-22.md";
  slug: "2020-12-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-23.md": {
	id: "2020-12-23.md";
  slug: "2020-12-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-24.md": {
	id: "2020-12-24.md";
  slug: "2020-12-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-25.md": {
	id: "2020-12-25.md";
  slug: "2020-12-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-26.md": {
	id: "2020-12-26.md";
  slug: "2020-12-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-27.md": {
	id: "2020-12-27.md";
  slug: "2020-12-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-28.md": {
	id: "2020-12-28.md";
  slug: "2020-12-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-29.md": {
	id: "2020-12-29.md";
  slug: "2020-12-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-30.md": {
	id: "2020-12-30.md";
  slug: "2020-12-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2020-12-31.md": {
	id: "2020-12-31.md";
  slug: "2020-12-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-01.md": {
	id: "2021-01-01.md";
  slug: "2021-01-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-02.md": {
	id: "2021-01-02.md";
  slug: "2021-01-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-03.md": {
	id: "2021-01-03.md";
  slug: "2021-01-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-04.md": {
	id: "2021-01-04.md";
  slug: "2021-01-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-05.md": {
	id: "2021-01-05.md";
  slug: "2021-01-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-06.md": {
	id: "2021-01-06.md";
  slug: "2021-01-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-07.md": {
	id: "2021-01-07.md";
  slug: "2021-01-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-08.md": {
	id: "2021-01-08.md";
  slug: "2021-01-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-09.md": {
	id: "2021-01-09.md";
  slug: "2021-01-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-10.md": {
	id: "2021-01-10.md";
  slug: "2021-01-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-11.md": {
	id: "2021-01-11.md";
  slug: "2021-01-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-12.md": {
	id: "2021-01-12.md";
  slug: "2021-01-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-13.md": {
	id: "2021-01-13.md";
  slug: "2021-01-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-14.md": {
	id: "2021-01-14.md";
  slug: "2021-01-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-15.md": {
	id: "2021-01-15.md";
  slug: "2021-01-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-16.md": {
	id: "2021-01-16.md";
  slug: "2021-01-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-17.md": {
	id: "2021-01-17.md";
  slug: "2021-01-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-18.md": {
	id: "2021-01-18.md";
  slug: "2021-01-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-19.md": {
	id: "2021-01-19.md";
  slug: "2021-01-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-20.md": {
	id: "2021-01-20.md";
  slug: "2021-01-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-21.md": {
	id: "2021-01-21.md";
  slug: "2021-01-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-22.md": {
	id: "2021-01-22.md";
  slug: "2021-01-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-23.md": {
	id: "2021-01-23.md";
  slug: "2021-01-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-24.md": {
	id: "2021-01-24.md";
  slug: "2021-01-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-25.md": {
	id: "2021-01-25.md";
  slug: "2021-01-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-26.md": {
	id: "2021-01-26.md";
  slug: "2021-01-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-27.md": {
	id: "2021-01-27.md";
  slug: "2021-01-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-28.md": {
	id: "2021-01-28.md";
  slug: "2021-01-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-29.md": {
	id: "2021-01-29.md";
  slug: "2021-01-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-30.md": {
	id: "2021-01-30.md";
  slug: "2021-01-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-01-31.md": {
	id: "2021-01-31.md";
  slug: "2021-01-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-01.md": {
	id: "2021-02-01.md";
  slug: "2021-02-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-02.md": {
	id: "2021-02-02.md";
  slug: "2021-02-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-03.md": {
	id: "2021-02-03.md";
  slug: "2021-02-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-04.md": {
	id: "2021-02-04.md";
  slug: "2021-02-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-05.md": {
	id: "2021-02-05.md";
  slug: "2021-02-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-06.md": {
	id: "2021-02-06.md";
  slug: "2021-02-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-07.md": {
	id: "2021-02-07.md";
  slug: "2021-02-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-08.md": {
	id: "2021-02-08.md";
  slug: "2021-02-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-09.md": {
	id: "2021-02-09.md";
  slug: "2021-02-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-10.md": {
	id: "2021-02-10.md";
  slug: "2021-02-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-11.md": {
	id: "2021-02-11.md";
  slug: "2021-02-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-12.md": {
	id: "2021-02-12.md";
  slug: "2021-02-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-13.md": {
	id: "2021-02-13.md";
  slug: "2021-02-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-14.md": {
	id: "2021-02-14.md";
  slug: "2021-02-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-15.md": {
	id: "2021-02-15.md";
  slug: "2021-02-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-16.md": {
	id: "2021-02-16.md";
  slug: "2021-02-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-17.md": {
	id: "2021-02-17.md";
  slug: "2021-02-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-18.md": {
	id: "2021-02-18.md";
  slug: "2021-02-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-19.md": {
	id: "2021-02-19.md";
  slug: "2021-02-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-20.md": {
	id: "2021-02-20.md";
  slug: "2021-02-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-21.md": {
	id: "2021-02-21.md";
  slug: "2021-02-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-22.md": {
	id: "2021-02-22.md";
  slug: "2021-02-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-23.md": {
	id: "2021-02-23.md";
  slug: "2021-02-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-24.md": {
	id: "2021-02-24.md";
  slug: "2021-02-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-25.md": {
	id: "2021-02-25.md";
  slug: "2021-02-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-26.md": {
	id: "2021-02-26.md";
  slug: "2021-02-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-27.md": {
	id: "2021-02-27.md";
  slug: "2021-02-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-02-28.md": {
	id: "2021-02-28.md";
  slug: "2021-02-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-01.md": {
	id: "2021-03-01.md";
  slug: "2021-03-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-02.md": {
	id: "2021-03-02.md";
  slug: "2021-03-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-03.md": {
	id: "2021-03-03.md";
  slug: "2021-03-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-04.md": {
	id: "2021-03-04.md";
  slug: "2021-03-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-05.md": {
	id: "2021-03-05.md";
  slug: "2021-03-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-06.md": {
	id: "2021-03-06.md";
  slug: "2021-03-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-07.md": {
	id: "2021-03-07.md";
  slug: "2021-03-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-08.md": {
	id: "2021-03-08.md";
  slug: "2021-03-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-09.md": {
	id: "2021-03-09.md";
  slug: "2021-03-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-10.md": {
	id: "2021-03-10.md";
  slug: "2021-03-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-11.md": {
	id: "2021-03-11.md";
  slug: "2021-03-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-12.md": {
	id: "2021-03-12.md";
  slug: "2021-03-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-13.md": {
	id: "2021-03-13.md";
  slug: "2021-03-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-14.md": {
	id: "2021-03-14.md";
  slug: "2021-03-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-15.md": {
	id: "2021-03-15.md";
  slug: "2021-03-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-16.md": {
	id: "2021-03-16.md";
  slug: "2021-03-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-17.md": {
	id: "2021-03-17.md";
  slug: "2021-03-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-18.md": {
	id: "2021-03-18.md";
  slug: "2021-03-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-19.md": {
	id: "2021-03-19.md";
  slug: "2021-03-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-20.md": {
	id: "2021-03-20.md";
  slug: "2021-03-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-21.md": {
	id: "2021-03-21.md";
  slug: "2021-03-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-22.md": {
	id: "2021-03-22.md";
  slug: "2021-03-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-23.md": {
	id: "2021-03-23.md";
  slug: "2021-03-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-24.md": {
	id: "2021-03-24.md";
  slug: "2021-03-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-25.md": {
	id: "2021-03-25.md";
  slug: "2021-03-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-26.md": {
	id: "2021-03-26.md";
  slug: "2021-03-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-27.md": {
	id: "2021-03-27.md";
  slug: "2021-03-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-28.md": {
	id: "2021-03-28.md";
  slug: "2021-03-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-29.md": {
	id: "2021-03-29.md";
  slug: "2021-03-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-30.md": {
	id: "2021-03-30.md";
  slug: "2021-03-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-03-31.md": {
	id: "2021-03-31.md";
  slug: "2021-03-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-01.md": {
	id: "2021-04-01.md";
  slug: "2021-04-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-02.md": {
	id: "2021-04-02.md";
  slug: "2021-04-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-03.md": {
	id: "2021-04-03.md";
  slug: "2021-04-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-04.md": {
	id: "2021-04-04.md";
  slug: "2021-04-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-05.md": {
	id: "2021-04-05.md";
  slug: "2021-04-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-06.md": {
	id: "2021-04-06.md";
  slug: "2021-04-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-07.md": {
	id: "2021-04-07.md";
  slug: "2021-04-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-08.md": {
	id: "2021-04-08.md";
  slug: "2021-04-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-09.md": {
	id: "2021-04-09.md";
  slug: "2021-04-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-10.md": {
	id: "2021-04-10.md";
  slug: "2021-04-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-11.md": {
	id: "2021-04-11.md";
  slug: "2021-04-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-12.md": {
	id: "2021-04-12.md";
  slug: "2021-04-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-13.md": {
	id: "2021-04-13.md";
  slug: "2021-04-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-14.md": {
	id: "2021-04-14.md";
  slug: "2021-04-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-15.md": {
	id: "2021-04-15.md";
  slug: "2021-04-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-16.md": {
	id: "2021-04-16.md";
  slug: "2021-04-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-17.md": {
	id: "2021-04-17.md";
  slug: "2021-04-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-18.md": {
	id: "2021-04-18.md";
  slug: "2021-04-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-19.md": {
	id: "2021-04-19.md";
  slug: "2021-04-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-20.md": {
	id: "2021-04-20.md";
  slug: "2021-04-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-21.md": {
	id: "2021-04-21.md";
  slug: "2021-04-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-22.md": {
	id: "2021-04-22.md";
  slug: "2021-04-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-23.md": {
	id: "2021-04-23.md";
  slug: "2021-04-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-24.md": {
	id: "2021-04-24.md";
  slug: "2021-04-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-25.md": {
	id: "2021-04-25.md";
  slug: "2021-04-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-26.md": {
	id: "2021-04-26.md";
  slug: "2021-04-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-27.md": {
	id: "2021-04-27.md";
  slug: "2021-04-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-28.md": {
	id: "2021-04-28.md";
  slug: "2021-04-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-29.md": {
	id: "2021-04-29.md";
  slug: "2021-04-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-04-30.md": {
	id: "2021-04-30.md";
  slug: "2021-04-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-01.md": {
	id: "2021-05-01.md";
  slug: "2021-05-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-02.md": {
	id: "2021-05-02.md";
  slug: "2021-05-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-03.md": {
	id: "2021-05-03.md";
  slug: "2021-05-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-04.md": {
	id: "2021-05-04.md";
  slug: "2021-05-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-05.md": {
	id: "2021-05-05.md";
  slug: "2021-05-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-06.md": {
	id: "2021-05-06.md";
  slug: "2021-05-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-07.md": {
	id: "2021-05-07.md";
  slug: "2021-05-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-08.md": {
	id: "2021-05-08.md";
  slug: "2021-05-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-09.md": {
	id: "2021-05-09.md";
  slug: "2021-05-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-10.md": {
	id: "2021-05-10.md";
  slug: "2021-05-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-11.md": {
	id: "2021-05-11.md";
  slug: "2021-05-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-12.md": {
	id: "2021-05-12.md";
  slug: "2021-05-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-13.md": {
	id: "2021-05-13.md";
  slug: "2021-05-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-14.md": {
	id: "2021-05-14.md";
  slug: "2021-05-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-15.md": {
	id: "2021-05-15.md";
  slug: "2021-05-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-16.md": {
	id: "2021-05-16.md";
  slug: "2021-05-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-17.md": {
	id: "2021-05-17.md";
  slug: "2021-05-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-18.md": {
	id: "2021-05-18.md";
  slug: "2021-05-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-19.md": {
	id: "2021-05-19.md";
  slug: "2021-05-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-20.md": {
	id: "2021-05-20.md";
  slug: "2021-05-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-21.md": {
	id: "2021-05-21.md";
  slug: "2021-05-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-22.md": {
	id: "2021-05-22.md";
  slug: "2021-05-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-23.md": {
	id: "2021-05-23.md";
  slug: "2021-05-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-24.md": {
	id: "2021-05-24.md";
  slug: "2021-05-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-25.md": {
	id: "2021-05-25.md";
  slug: "2021-05-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-26.md": {
	id: "2021-05-26.md";
  slug: "2021-05-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-27.md": {
	id: "2021-05-27.md";
  slug: "2021-05-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-28.md": {
	id: "2021-05-28.md";
  slug: "2021-05-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-29.md": {
	id: "2021-05-29.md";
  slug: "2021-05-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-30.md": {
	id: "2021-05-30.md";
  slug: "2021-05-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-05-31.md": {
	id: "2021-05-31.md";
  slug: "2021-05-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-01.md": {
	id: "2021-06-01.md";
  slug: "2021-06-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-02.md": {
	id: "2021-06-02.md";
  slug: "2021-06-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-03.md": {
	id: "2021-06-03.md";
  slug: "2021-06-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-04.md": {
	id: "2021-06-04.md";
  slug: "2021-06-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-05.md": {
	id: "2021-06-05.md";
  slug: "2021-06-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-06.md": {
	id: "2021-06-06.md";
  slug: "2021-06-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-07.md": {
	id: "2021-06-07.md";
  slug: "2021-06-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-08.md": {
	id: "2021-06-08.md";
  slug: "2021-06-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-09.md": {
	id: "2021-06-09.md";
  slug: "2021-06-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-10.md": {
	id: "2021-06-10.md";
  slug: "2021-06-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-11.md": {
	id: "2021-06-11.md";
  slug: "2021-06-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-12.md": {
	id: "2021-06-12.md";
  slug: "2021-06-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-13.md": {
	id: "2021-06-13.md";
  slug: "2021-06-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-14.md": {
	id: "2021-06-14.md";
  slug: "2021-06-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-15.md": {
	id: "2021-06-15.md";
  slug: "2021-06-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-16.md": {
	id: "2021-06-16.md";
  slug: "2021-06-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-17.md": {
	id: "2021-06-17.md";
  slug: "2021-06-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-18.md": {
	id: "2021-06-18.md";
  slug: "2021-06-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-19.md": {
	id: "2021-06-19.md";
  slug: "2021-06-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-20.md": {
	id: "2021-06-20.md";
  slug: "2021-06-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-21.md": {
	id: "2021-06-21.md";
  slug: "2021-06-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-22.md": {
	id: "2021-06-22.md";
  slug: "2021-06-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-23.md": {
	id: "2021-06-23.md";
  slug: "2021-06-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-24.md": {
	id: "2021-06-24.md";
  slug: "2021-06-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-25.md": {
	id: "2021-06-25.md";
  slug: "2021-06-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-26.md": {
	id: "2021-06-26.md";
  slug: "2021-06-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-27.md": {
	id: "2021-06-27.md";
  slug: "2021-06-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-28.md": {
	id: "2021-06-28.md";
  slug: "2021-06-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-29.md": {
	id: "2021-06-29.md";
  slug: "2021-06-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-06-30.md": {
	id: "2021-06-30.md";
  slug: "2021-06-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-01.md": {
	id: "2021-07-01.md";
  slug: "2021-07-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-02.md": {
	id: "2021-07-02.md";
  slug: "2021-07-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-03.md": {
	id: "2021-07-03.md";
  slug: "2021-07-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-04.md": {
	id: "2021-07-04.md";
  slug: "2021-07-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-05.md": {
	id: "2021-07-05.md";
  slug: "2021-07-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-06.md": {
	id: "2021-07-06.md";
  slug: "2021-07-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-07.md": {
	id: "2021-07-07.md";
  slug: "2021-07-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-08.md": {
	id: "2021-07-08.md";
  slug: "2021-07-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-09.md": {
	id: "2021-07-09.md";
  slug: "2021-07-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-10.md": {
	id: "2021-07-10.md";
  slug: "2021-07-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-11.md": {
	id: "2021-07-11.md";
  slug: "2021-07-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-12.md": {
	id: "2021-07-12.md";
  slug: "2021-07-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-13.md": {
	id: "2021-07-13.md";
  slug: "2021-07-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-14.md": {
	id: "2021-07-14.md";
  slug: "2021-07-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-15.md": {
	id: "2021-07-15.md";
  slug: "2021-07-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-16.md": {
	id: "2021-07-16.md";
  slug: "2021-07-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-17.md": {
	id: "2021-07-17.md";
  slug: "2021-07-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-18.md": {
	id: "2021-07-18.md";
  slug: "2021-07-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-19.md": {
	id: "2021-07-19.md";
  slug: "2021-07-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-20.md": {
	id: "2021-07-20.md";
  slug: "2021-07-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-21.md": {
	id: "2021-07-21.md";
  slug: "2021-07-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-22.md": {
	id: "2021-07-22.md";
  slug: "2021-07-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-23.md": {
	id: "2021-07-23.md";
  slug: "2021-07-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-24.md": {
	id: "2021-07-24.md";
  slug: "2021-07-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-25.md": {
	id: "2021-07-25.md";
  slug: "2021-07-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-26.md": {
	id: "2021-07-26.md";
  slug: "2021-07-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-27.md": {
	id: "2021-07-27.md";
  slug: "2021-07-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-28.md": {
	id: "2021-07-28.md";
  slug: "2021-07-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-29.md": {
	id: "2021-07-29.md";
  slug: "2021-07-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-30.md": {
	id: "2021-07-30.md";
  slug: "2021-07-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-07-31.md": {
	id: "2021-07-31.md";
  slug: "2021-07-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-01.md": {
	id: "2021-08-01.md";
  slug: "2021-08-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-02.md": {
	id: "2021-08-02.md";
  slug: "2021-08-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-03.md": {
	id: "2021-08-03.md";
  slug: "2021-08-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-04.md": {
	id: "2021-08-04.md";
  slug: "2021-08-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-05.md": {
	id: "2021-08-05.md";
  slug: "2021-08-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-06.md": {
	id: "2021-08-06.md";
  slug: "2021-08-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-07.md": {
	id: "2021-08-07.md";
  slug: "2021-08-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-08.md": {
	id: "2021-08-08.md";
  slug: "2021-08-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-09.md": {
	id: "2021-08-09.md";
  slug: "2021-08-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-10.md": {
	id: "2021-08-10.md";
  slug: "2021-08-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-11.md": {
	id: "2021-08-11.md";
  slug: "2021-08-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-12.md": {
	id: "2021-08-12.md";
  slug: "2021-08-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-13.md": {
	id: "2021-08-13.md";
  slug: "2021-08-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-14.md": {
	id: "2021-08-14.md";
  slug: "2021-08-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-15.md": {
	id: "2021-08-15.md";
  slug: "2021-08-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-16.md": {
	id: "2021-08-16.md";
  slug: "2021-08-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-17.md": {
	id: "2021-08-17.md";
  slug: "2021-08-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-18.md": {
	id: "2021-08-18.md";
  slug: "2021-08-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-19.md": {
	id: "2021-08-19.md";
  slug: "2021-08-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-20.md": {
	id: "2021-08-20.md";
  slug: "2021-08-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-21.md": {
	id: "2021-08-21.md";
  slug: "2021-08-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-22.md": {
	id: "2021-08-22.md";
  slug: "2021-08-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-23.md": {
	id: "2021-08-23.md";
  slug: "2021-08-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-24.md": {
	id: "2021-08-24.md";
  slug: "2021-08-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-25.md": {
	id: "2021-08-25.md";
  slug: "2021-08-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-26.md": {
	id: "2021-08-26.md";
  slug: "2021-08-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-27.md": {
	id: "2021-08-27.md";
  slug: "2021-08-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-28.md": {
	id: "2021-08-28.md";
  slug: "2021-08-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-29.md": {
	id: "2021-08-29.md";
  slug: "2021-08-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-30.md": {
	id: "2021-08-30.md";
  slug: "2021-08-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-08-31.md": {
	id: "2021-08-31.md";
  slug: "2021-08-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-01.md": {
	id: "2021-09-01.md";
  slug: "2021-09-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-02.md": {
	id: "2021-09-02.md";
  slug: "2021-09-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-03.md": {
	id: "2021-09-03.md";
  slug: "2021-09-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-04.md": {
	id: "2021-09-04.md";
  slug: "2021-09-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-05.md": {
	id: "2021-09-05.md";
  slug: "2021-09-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-06.md": {
	id: "2021-09-06.md";
  slug: "2021-09-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-07.md": {
	id: "2021-09-07.md";
  slug: "2021-09-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-08.md": {
	id: "2021-09-08.md";
  slug: "2021-09-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-09.md": {
	id: "2021-09-09.md";
  slug: "2021-09-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-10.md": {
	id: "2021-09-10.md";
  slug: "2021-09-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-11.md": {
	id: "2021-09-11.md";
  slug: "2021-09-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-12.md": {
	id: "2021-09-12.md";
  slug: "2021-09-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-13.md": {
	id: "2021-09-13.md";
  slug: "2021-09-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-14.md": {
	id: "2021-09-14.md";
  slug: "2021-09-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-15.md": {
	id: "2021-09-15.md";
  slug: "2021-09-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-16.md": {
	id: "2021-09-16.md";
  slug: "2021-09-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-17.md": {
	id: "2021-09-17.md";
  slug: "2021-09-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-18.md": {
	id: "2021-09-18.md";
  slug: "2021-09-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-19.md": {
	id: "2021-09-19.md";
  slug: "2021-09-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-20.md": {
	id: "2021-09-20.md";
  slug: "2021-09-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-21.md": {
	id: "2021-09-21.md";
  slug: "2021-09-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-22.md": {
	id: "2021-09-22.md";
  slug: "2021-09-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-23.md": {
	id: "2021-09-23.md";
  slug: "2021-09-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-24.md": {
	id: "2021-09-24.md";
  slug: "2021-09-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-25.md": {
	id: "2021-09-25.md";
  slug: "2021-09-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-26.md": {
	id: "2021-09-26.md";
  slug: "2021-09-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-27.md": {
	id: "2021-09-27.md";
  slug: "2021-09-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-28.md": {
	id: "2021-09-28.md";
  slug: "2021-09-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-29.md": {
	id: "2021-09-29.md";
  slug: "2021-09-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-09-30.md": {
	id: "2021-09-30.md";
  slug: "2021-09-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-01.md": {
	id: "2021-10-01.md";
  slug: "2021-10-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-02.md": {
	id: "2021-10-02.md";
  slug: "2021-10-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-03.md": {
	id: "2021-10-03.md";
  slug: "2021-10-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-04.md": {
	id: "2021-10-04.md";
  slug: "2021-10-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-05.md": {
	id: "2021-10-05.md";
  slug: "2021-10-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-06.md": {
	id: "2021-10-06.md";
  slug: "2021-10-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-07.md": {
	id: "2021-10-07.md";
  slug: "2021-10-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-08.md": {
	id: "2021-10-08.md";
  slug: "2021-10-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-09.md": {
	id: "2021-10-09.md";
  slug: "2021-10-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-10.md": {
	id: "2021-10-10.md";
  slug: "2021-10-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-11.md": {
	id: "2021-10-11.md";
  slug: "2021-10-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-12.md": {
	id: "2021-10-12.md";
  slug: "2021-10-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-13.md": {
	id: "2021-10-13.md";
  slug: "2021-10-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-14.md": {
	id: "2021-10-14.md";
  slug: "2021-10-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-15.md": {
	id: "2021-10-15.md";
  slug: "2021-10-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-16.md": {
	id: "2021-10-16.md";
  slug: "2021-10-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-17.md": {
	id: "2021-10-17.md";
  slug: "2021-10-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-18.md": {
	id: "2021-10-18.md";
  slug: "2021-10-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-19.md": {
	id: "2021-10-19.md";
  slug: "2021-10-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-20.md": {
	id: "2021-10-20.md";
  slug: "2021-10-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-21.md": {
	id: "2021-10-21.md";
  slug: "2021-10-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-22.md": {
	id: "2021-10-22.md";
  slug: "2021-10-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-23.md": {
	id: "2021-10-23.md";
  slug: "2021-10-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-24.md": {
	id: "2021-10-24.md";
  slug: "2021-10-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-25.md": {
	id: "2021-10-25.md";
  slug: "2021-10-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-26.md": {
	id: "2021-10-26.md";
  slug: "2021-10-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-27.md": {
	id: "2021-10-27.md";
  slug: "2021-10-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-28.md": {
	id: "2021-10-28.md";
  slug: "2021-10-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-29.md": {
	id: "2021-10-29.md";
  slug: "2021-10-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-30.md": {
	id: "2021-10-30.md";
  slug: "2021-10-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-10-31.md": {
	id: "2021-10-31.md";
  slug: "2021-10-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-01.md": {
	id: "2021-11-01.md";
  slug: "2021-11-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-02.md": {
	id: "2021-11-02.md";
  slug: "2021-11-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-03.md": {
	id: "2021-11-03.md";
  slug: "2021-11-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-04.md": {
	id: "2021-11-04.md";
  slug: "2021-11-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-05.md": {
	id: "2021-11-05.md";
  slug: "2021-11-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-06.md": {
	id: "2021-11-06.md";
  slug: "2021-11-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-07.md": {
	id: "2021-11-07.md";
  slug: "2021-11-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-08.md": {
	id: "2021-11-08.md";
  slug: "2021-11-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-09.md": {
	id: "2021-11-09.md";
  slug: "2021-11-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-10.md": {
	id: "2021-11-10.md";
  slug: "2021-11-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-11.md": {
	id: "2021-11-11.md";
  slug: "2021-11-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-12.md": {
	id: "2021-11-12.md";
  slug: "2021-11-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-13.md": {
	id: "2021-11-13.md";
  slug: "2021-11-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-14.md": {
	id: "2021-11-14.md";
  slug: "2021-11-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-15.md": {
	id: "2021-11-15.md";
  slug: "2021-11-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-16.md": {
	id: "2021-11-16.md";
  slug: "2021-11-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-17.md": {
	id: "2021-11-17.md";
  slug: "2021-11-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-18.md": {
	id: "2021-11-18.md";
  slug: "2021-11-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-19.md": {
	id: "2021-11-19.md";
  slug: "2021-11-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-20.md": {
	id: "2021-11-20.md";
  slug: "2021-11-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-21.md": {
	id: "2021-11-21.md";
  slug: "2021-11-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-22.md": {
	id: "2021-11-22.md";
  slug: "2021-11-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-23.md": {
	id: "2021-11-23.md";
  slug: "2021-11-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-24.md": {
	id: "2021-11-24.md";
  slug: "2021-11-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-25.md": {
	id: "2021-11-25.md";
  slug: "2021-11-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-26.md": {
	id: "2021-11-26.md";
  slug: "2021-11-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-27.md": {
	id: "2021-11-27.md";
  slug: "2021-11-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-28.md": {
	id: "2021-11-28.md";
  slug: "2021-11-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-29.md": {
	id: "2021-11-29.md";
  slug: "2021-11-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-11-30.md": {
	id: "2021-11-30.md";
  slug: "2021-11-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-01.md": {
	id: "2021-12-01.md";
  slug: "2021-12-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-02.md": {
	id: "2021-12-02.md";
  slug: "2021-12-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-03.md": {
	id: "2021-12-03.md";
  slug: "2021-12-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-04.md": {
	id: "2021-12-04.md";
  slug: "2021-12-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-05.md": {
	id: "2021-12-05.md";
  slug: "2021-12-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-06.md": {
	id: "2021-12-06.md";
  slug: "2021-12-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-07.md": {
	id: "2021-12-07.md";
  slug: "2021-12-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-08.md": {
	id: "2021-12-08.md";
  slug: "2021-12-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-09.md": {
	id: "2021-12-09.md";
  slug: "2021-12-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-10.md": {
	id: "2021-12-10.md";
  slug: "2021-12-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-11.md": {
	id: "2021-12-11.md";
  slug: "2021-12-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-12.md": {
	id: "2021-12-12.md";
  slug: "2021-12-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-13.md": {
	id: "2021-12-13.md";
  slug: "2021-12-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-14.md": {
	id: "2021-12-14.md";
  slug: "2021-12-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-15.md": {
	id: "2021-12-15.md";
  slug: "2021-12-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-16.md": {
	id: "2021-12-16.md";
  slug: "2021-12-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-17.md": {
	id: "2021-12-17.md";
  slug: "2021-12-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-18.md": {
	id: "2021-12-18.md";
  slug: "2021-12-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-19.md": {
	id: "2021-12-19.md";
  slug: "2021-12-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-20.md": {
	id: "2021-12-20.md";
  slug: "2021-12-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-21.md": {
	id: "2021-12-21.md";
  slug: "2021-12-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-22.md": {
	id: "2021-12-22.md";
  slug: "2021-12-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-23.md": {
	id: "2021-12-23.md";
  slug: "2021-12-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-24.md": {
	id: "2021-12-24.md";
  slug: "2021-12-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-25.md": {
	id: "2021-12-25.md";
  slug: "2021-12-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-26.md": {
	id: "2021-12-26.md";
  slug: "2021-12-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-27.md": {
	id: "2021-12-27.md";
  slug: "2021-12-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-28.md": {
	id: "2021-12-28.md";
  slug: "2021-12-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-29.md": {
	id: "2021-12-29.md";
  slug: "2021-12-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-30.md": {
	id: "2021-12-30.md";
  slug: "2021-12-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2021-12-31.md": {
	id: "2021-12-31.md";
  slug: "2021-12-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-01.md": {
	id: "2022-01-01.md";
  slug: "2022-01-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-02.md": {
	id: "2022-01-02.md";
  slug: "2022-01-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-03.md": {
	id: "2022-01-03.md";
  slug: "2022-01-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-04.md": {
	id: "2022-01-04.md";
  slug: "2022-01-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-05.md": {
	id: "2022-01-05.md";
  slug: "2022-01-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-06.md": {
	id: "2022-01-06.md";
  slug: "2022-01-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-07.md": {
	id: "2022-01-07.md";
  slug: "2022-01-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-08.md": {
	id: "2022-01-08.md";
  slug: "2022-01-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-09.md": {
	id: "2022-01-09.md";
  slug: "2022-01-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-10.md": {
	id: "2022-01-10.md";
  slug: "2022-01-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-11.md": {
	id: "2022-01-11.md";
  slug: "2022-01-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-12.md": {
	id: "2022-01-12.md";
  slug: "2022-01-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-13.md": {
	id: "2022-01-13.md";
  slug: "2022-01-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-14.md": {
	id: "2022-01-14.md";
  slug: "2022-01-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-15.md": {
	id: "2022-01-15.md";
  slug: "2022-01-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-16.md": {
	id: "2022-01-16.md";
  slug: "2022-01-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-17.md": {
	id: "2022-01-17.md";
  slug: "2022-01-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-18.md": {
	id: "2022-01-18.md";
  slug: "2022-01-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-19.md": {
	id: "2022-01-19.md";
  slug: "2022-01-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-20.md": {
	id: "2022-01-20.md";
  slug: "2022-01-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-21.md": {
	id: "2022-01-21.md";
  slug: "2022-01-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-22.md": {
	id: "2022-01-22.md";
  slug: "2022-01-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-23.md": {
	id: "2022-01-23.md";
  slug: "2022-01-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-24.md": {
	id: "2022-01-24.md";
  slug: "2022-01-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-25.md": {
	id: "2022-01-25.md";
  slug: "2022-01-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-26.md": {
	id: "2022-01-26.md";
  slug: "2022-01-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-27.md": {
	id: "2022-01-27.md";
  slug: "2022-01-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-28.md": {
	id: "2022-01-28.md";
  slug: "2022-01-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-29.md": {
	id: "2022-01-29.md";
  slug: "2022-01-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-30.md": {
	id: "2022-01-30.md";
  slug: "2022-01-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-01-31.md": {
	id: "2022-01-31.md";
  slug: "2022-01-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-01.md": {
	id: "2022-02-01.md";
  slug: "2022-02-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-02.md": {
	id: "2022-02-02.md";
  slug: "2022-02-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-03.md": {
	id: "2022-02-03.md";
  slug: "2022-02-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-04.md": {
	id: "2022-02-04.md";
  slug: "2022-02-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-05.md": {
	id: "2022-02-05.md";
  slug: "2022-02-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-06.md": {
	id: "2022-02-06.md";
  slug: "2022-02-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-07.md": {
	id: "2022-02-07.md";
  slug: "2022-02-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-08.md": {
	id: "2022-02-08.md";
  slug: "2022-02-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-09.md": {
	id: "2022-02-09.md";
  slug: "2022-02-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-10.md": {
	id: "2022-02-10.md";
  slug: "2022-02-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-11.md": {
	id: "2022-02-11.md";
  slug: "2022-02-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-12.md": {
	id: "2022-02-12.md";
  slug: "2022-02-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-13.md": {
	id: "2022-02-13.md";
  slug: "2022-02-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-14.md": {
	id: "2022-02-14.md";
  slug: "2022-02-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-15.md": {
	id: "2022-02-15.md";
  slug: "2022-02-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-16.md": {
	id: "2022-02-16.md";
  slug: "2022-02-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-17.md": {
	id: "2022-02-17.md";
  slug: "2022-02-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-18.md": {
	id: "2022-02-18.md";
  slug: "2022-02-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-19.md": {
	id: "2022-02-19.md";
  slug: "2022-02-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-20.md": {
	id: "2022-02-20.md";
  slug: "2022-02-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-21.md": {
	id: "2022-02-21.md";
  slug: "2022-02-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-22.md": {
	id: "2022-02-22.md";
  slug: "2022-02-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-23.md": {
	id: "2022-02-23.md";
  slug: "2022-02-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-24.md": {
	id: "2022-02-24.md";
  slug: "2022-02-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-25.md": {
	id: "2022-02-25.md";
  slug: "2022-02-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-26.md": {
	id: "2022-02-26.md";
  slug: "2022-02-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-27.md": {
	id: "2022-02-27.md";
  slug: "2022-02-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-02-28.md": {
	id: "2022-02-28.md";
  slug: "2022-02-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-01.md": {
	id: "2022-03-01.md";
  slug: "2022-03-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-02.md": {
	id: "2022-03-02.md";
  slug: "2022-03-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-03.md": {
	id: "2022-03-03.md";
  slug: "2022-03-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-04.md": {
	id: "2022-03-04.md";
  slug: "2022-03-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-05.md": {
	id: "2022-03-05.md";
  slug: "2022-03-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-06.md": {
	id: "2022-03-06.md";
  slug: "2022-03-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-07.md": {
	id: "2022-03-07.md";
  slug: "2022-03-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-08.md": {
	id: "2022-03-08.md";
  slug: "2022-03-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-09.md": {
	id: "2022-03-09.md";
  slug: "2022-03-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-10.md": {
	id: "2022-03-10.md";
  slug: "2022-03-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-11.md": {
	id: "2022-03-11.md";
  slug: "2022-03-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-12.md": {
	id: "2022-03-12.md";
  slug: "2022-03-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-13.md": {
	id: "2022-03-13.md";
  slug: "2022-03-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-14.md": {
	id: "2022-03-14.md";
  slug: "2022-03-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-15.md": {
	id: "2022-03-15.md";
  slug: "2022-03-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-16.md": {
	id: "2022-03-16.md";
  slug: "2022-03-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-17.md": {
	id: "2022-03-17.md";
  slug: "2022-03-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-18.md": {
	id: "2022-03-18.md";
  slug: "2022-03-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-19.md": {
	id: "2022-03-19.md";
  slug: "2022-03-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-20.md": {
	id: "2022-03-20.md";
  slug: "2022-03-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-21.md": {
	id: "2022-03-21.md";
  slug: "2022-03-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-22.md": {
	id: "2022-03-22.md";
  slug: "2022-03-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-23.md": {
	id: "2022-03-23.md";
  slug: "2022-03-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-24.md": {
	id: "2022-03-24.md";
  slug: "2022-03-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-25.md": {
	id: "2022-03-25.md";
  slug: "2022-03-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-26.md": {
	id: "2022-03-26.md";
  slug: "2022-03-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-27.md": {
	id: "2022-03-27.md";
  slug: "2022-03-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-28.md": {
	id: "2022-03-28.md";
  slug: "2022-03-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-29.md": {
	id: "2022-03-29.md";
  slug: "2022-03-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-30.md": {
	id: "2022-03-30.md";
  slug: "2022-03-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-03-31.md": {
	id: "2022-03-31.md";
  slug: "2022-03-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-01.md": {
	id: "2022-04-01.md";
  slug: "2022-04-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-02.md": {
	id: "2022-04-02.md";
  slug: "2022-04-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-03.md": {
	id: "2022-04-03.md";
  slug: "2022-04-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-04.md": {
	id: "2022-04-04.md";
  slug: "2022-04-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-05.md": {
	id: "2022-04-05.md";
  slug: "2022-04-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-06.md": {
	id: "2022-04-06.md";
  slug: "2022-04-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-07.md": {
	id: "2022-04-07.md";
  slug: "2022-04-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-08.md": {
	id: "2022-04-08.md";
  slug: "2022-04-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-09.md": {
	id: "2022-04-09.md";
  slug: "2022-04-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-10.md": {
	id: "2022-04-10.md";
  slug: "2022-04-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-11.md": {
	id: "2022-04-11.md";
  slug: "2022-04-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-12.md": {
	id: "2022-04-12.md";
  slug: "2022-04-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-13.md": {
	id: "2022-04-13.md";
  slug: "2022-04-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-14.md": {
	id: "2022-04-14.md";
  slug: "2022-04-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-15.md": {
	id: "2022-04-15.md";
  slug: "2022-04-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-16.md": {
	id: "2022-04-16.md";
  slug: "2022-04-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-17.md": {
	id: "2022-04-17.md";
  slug: "2022-04-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-18.md": {
	id: "2022-04-18.md";
  slug: "2022-04-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-19.md": {
	id: "2022-04-19.md";
  slug: "2022-04-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-20.md": {
	id: "2022-04-20.md";
  slug: "2022-04-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-21.md": {
	id: "2022-04-21.md";
  slug: "2022-04-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-22.md": {
	id: "2022-04-22.md";
  slug: "2022-04-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-23.md": {
	id: "2022-04-23.md";
  slug: "2022-04-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-24.md": {
	id: "2022-04-24.md";
  slug: "2022-04-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-25.md": {
	id: "2022-04-25.md";
  slug: "2022-04-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-26.md": {
	id: "2022-04-26.md";
  slug: "2022-04-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-27.md": {
	id: "2022-04-27.md";
  slug: "2022-04-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-28.md": {
	id: "2022-04-28.md";
  slug: "2022-04-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-29.md": {
	id: "2022-04-29.md";
  slug: "2022-04-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-04-30.md": {
	id: "2022-04-30.md";
  slug: "2022-04-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-01.md": {
	id: "2022-05-01.md";
  slug: "2022-05-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-02.md": {
	id: "2022-05-02.md";
  slug: "2022-05-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-03.md": {
	id: "2022-05-03.md";
  slug: "2022-05-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-04.md": {
	id: "2022-05-04.md";
  slug: "2022-05-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-05.md": {
	id: "2022-05-05.md";
  slug: "2022-05-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-06.md": {
	id: "2022-05-06.md";
  slug: "2022-05-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-07.md": {
	id: "2022-05-07.md";
  slug: "2022-05-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-08.md": {
	id: "2022-05-08.md";
  slug: "2022-05-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-09.md": {
	id: "2022-05-09.md";
  slug: "2022-05-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-10.md": {
	id: "2022-05-10.md";
  slug: "2022-05-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-11.md": {
	id: "2022-05-11.md";
  slug: "2022-05-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-12.md": {
	id: "2022-05-12.md";
  slug: "2022-05-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-13.md": {
	id: "2022-05-13.md";
  slug: "2022-05-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-14.md": {
	id: "2022-05-14.md";
  slug: "2022-05-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-15.md": {
	id: "2022-05-15.md";
  slug: "2022-05-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-16.md": {
	id: "2022-05-16.md";
  slug: "2022-05-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-17.md": {
	id: "2022-05-17.md";
  slug: "2022-05-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-18.md": {
	id: "2022-05-18.md";
  slug: "2022-05-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-19.md": {
	id: "2022-05-19.md";
  slug: "2022-05-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-20.md": {
	id: "2022-05-20.md";
  slug: "2022-05-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-21.md": {
	id: "2022-05-21.md";
  slug: "2022-05-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-22.md": {
	id: "2022-05-22.md";
  slug: "2022-05-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-23.md": {
	id: "2022-05-23.md";
  slug: "2022-05-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-24.md": {
	id: "2022-05-24.md";
  slug: "2022-05-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-25.md": {
	id: "2022-05-25.md";
  slug: "2022-05-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-26.md": {
	id: "2022-05-26.md";
  slug: "2022-05-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-27.md": {
	id: "2022-05-27.md";
  slug: "2022-05-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-28.md": {
	id: "2022-05-28.md";
  slug: "2022-05-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-29.md": {
	id: "2022-05-29.md";
  slug: "2022-05-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-30.md": {
	id: "2022-05-30.md";
  slug: "2022-05-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-05-31.md": {
	id: "2022-05-31.md";
  slug: "2022-05-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-01.md": {
	id: "2022-06-01.md";
  slug: "2022-06-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-02.md": {
	id: "2022-06-02.md";
  slug: "2022-06-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-03.md": {
	id: "2022-06-03.md";
  slug: "2022-06-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-04.md": {
	id: "2022-06-04.md";
  slug: "2022-06-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-05.md": {
	id: "2022-06-05.md";
  slug: "2022-06-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-06.md": {
	id: "2022-06-06.md";
  slug: "2022-06-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-07.md": {
	id: "2022-06-07.md";
  slug: "2022-06-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-08.md": {
	id: "2022-06-08.md";
  slug: "2022-06-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-09.md": {
	id: "2022-06-09.md";
  slug: "2022-06-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-10.md": {
	id: "2022-06-10.md";
  slug: "2022-06-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-11.md": {
	id: "2022-06-11.md";
  slug: "2022-06-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-12.md": {
	id: "2022-06-12.md";
  slug: "2022-06-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-13.md": {
	id: "2022-06-13.md";
  slug: "2022-06-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-14.md": {
	id: "2022-06-14.md";
  slug: "2022-06-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-15.md": {
	id: "2022-06-15.md";
  slug: "2022-06-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-16.md": {
	id: "2022-06-16.md";
  slug: "2022-06-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-17.md": {
	id: "2022-06-17.md";
  slug: "2022-06-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-18.md": {
	id: "2022-06-18.md";
  slug: "2022-06-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-19.md": {
	id: "2022-06-19.md";
  slug: "2022-06-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-20.md": {
	id: "2022-06-20.md";
  slug: "2022-06-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-21.md": {
	id: "2022-06-21.md";
  slug: "2022-06-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-22.md": {
	id: "2022-06-22.md";
  slug: "2022-06-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-23.md": {
	id: "2022-06-23.md";
  slug: "2022-06-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-24.md": {
	id: "2022-06-24.md";
  slug: "2022-06-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-25.md": {
	id: "2022-06-25.md";
  slug: "2022-06-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-26.md": {
	id: "2022-06-26.md";
  slug: "2022-06-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-27.md": {
	id: "2022-06-27.md";
  slug: "2022-06-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-28.md": {
	id: "2022-06-28.md";
  slug: "2022-06-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-29.md": {
	id: "2022-06-29.md";
  slug: "2022-06-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-06-30.md": {
	id: "2022-06-30.md";
  slug: "2022-06-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-01.md": {
	id: "2022-07-01.md";
  slug: "2022-07-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-02.md": {
	id: "2022-07-02.md";
  slug: "2022-07-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-03.md": {
	id: "2022-07-03.md";
  slug: "2022-07-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-04.md": {
	id: "2022-07-04.md";
  slug: "2022-07-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-05.md": {
	id: "2022-07-05.md";
  slug: "2022-07-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-06.md": {
	id: "2022-07-06.md";
  slug: "2022-07-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-07.md": {
	id: "2022-07-07.md";
  slug: "2022-07-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-08.md": {
	id: "2022-07-08.md";
  slug: "2022-07-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-09.md": {
	id: "2022-07-09.md";
  slug: "2022-07-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-10.md": {
	id: "2022-07-10.md";
  slug: "2022-07-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-11.md": {
	id: "2022-07-11.md";
  slug: "2022-07-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-12.md": {
	id: "2022-07-12.md";
  slug: "2022-07-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-13.md": {
	id: "2022-07-13.md";
  slug: "2022-07-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-14.md": {
	id: "2022-07-14.md";
  slug: "2022-07-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-15.md": {
	id: "2022-07-15.md";
  slug: "2022-07-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-16.md": {
	id: "2022-07-16.md";
  slug: "2022-07-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-17.md": {
	id: "2022-07-17.md";
  slug: "2022-07-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-18.md": {
	id: "2022-07-18.md";
  slug: "2022-07-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-19.md": {
	id: "2022-07-19.md";
  slug: "2022-07-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-20.md": {
	id: "2022-07-20.md";
  slug: "2022-07-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-21.md": {
	id: "2022-07-21.md";
  slug: "2022-07-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-22.md": {
	id: "2022-07-22.md";
  slug: "2022-07-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-23.md": {
	id: "2022-07-23.md";
  slug: "2022-07-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-24.md": {
	id: "2022-07-24.md";
  slug: "2022-07-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-25.md": {
	id: "2022-07-25.md";
  slug: "2022-07-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-26.md": {
	id: "2022-07-26.md";
  slug: "2022-07-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-27.md": {
	id: "2022-07-27.md";
  slug: "2022-07-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-28.md": {
	id: "2022-07-28.md";
  slug: "2022-07-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-29.md": {
	id: "2022-07-29.md";
  slug: "2022-07-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-30.md": {
	id: "2022-07-30.md";
  slug: "2022-07-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-07-31.md": {
	id: "2022-07-31.md";
  slug: "2022-07-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-01.md": {
	id: "2022-08-01.md";
  slug: "2022-08-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-02.md": {
	id: "2022-08-02.md";
  slug: "2022-08-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-03.md": {
	id: "2022-08-03.md";
  slug: "2022-08-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-04.md": {
	id: "2022-08-04.md";
  slug: "2022-08-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-05.md": {
	id: "2022-08-05.md";
  slug: "2022-08-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-06.md": {
	id: "2022-08-06.md";
  slug: "2022-08-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-07.md": {
	id: "2022-08-07.md";
  slug: "2022-08-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-08.md": {
	id: "2022-08-08.md";
  slug: "2022-08-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-09.md": {
	id: "2022-08-09.md";
  slug: "2022-08-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-10.md": {
	id: "2022-08-10.md";
  slug: "2022-08-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-11.md": {
	id: "2022-08-11.md";
  slug: "2022-08-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-12.md": {
	id: "2022-08-12.md";
  slug: "2022-08-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-13.md": {
	id: "2022-08-13.md";
  slug: "2022-08-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-14.md": {
	id: "2022-08-14.md";
  slug: "2022-08-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-15.md": {
	id: "2022-08-15.md";
  slug: "2022-08-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-16.md": {
	id: "2022-08-16.md";
  slug: "2022-08-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-17.md": {
	id: "2022-08-17.md";
  slug: "2022-08-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-18.md": {
	id: "2022-08-18.md";
  slug: "2022-08-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-19.md": {
	id: "2022-08-19.md";
  slug: "2022-08-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-20.md": {
	id: "2022-08-20.md";
  slug: "2022-08-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-21.md": {
	id: "2022-08-21.md";
  slug: "2022-08-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-22.md": {
	id: "2022-08-22.md";
  slug: "2022-08-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-23.md": {
	id: "2022-08-23.md";
  slug: "2022-08-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-24.md": {
	id: "2022-08-24.md";
  slug: "2022-08-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-25.md": {
	id: "2022-08-25.md";
  slug: "2022-08-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-26.md": {
	id: "2022-08-26.md";
  slug: "2022-08-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-27.md": {
	id: "2022-08-27.md";
  slug: "2022-08-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-28.md": {
	id: "2022-08-28.md";
  slug: "2022-08-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-29.md": {
	id: "2022-08-29.md";
  slug: "2022-08-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-30.md": {
	id: "2022-08-30.md";
  slug: "2022-08-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-08-31.md": {
	id: "2022-08-31.md";
  slug: "2022-08-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-01.md": {
	id: "2022-09-01.md";
  slug: "2022-09-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-02.md": {
	id: "2022-09-02.md";
  slug: "2022-09-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-03.md": {
	id: "2022-09-03.md";
  slug: "2022-09-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-04.md": {
	id: "2022-09-04.md";
  slug: "2022-09-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-05.md": {
	id: "2022-09-05.md";
  slug: "2022-09-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-06.md": {
	id: "2022-09-06.md";
  slug: "2022-09-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-07.md": {
	id: "2022-09-07.md";
  slug: "2022-09-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-08.md": {
	id: "2022-09-08.md";
  slug: "2022-09-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-09.md": {
	id: "2022-09-09.md";
  slug: "2022-09-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-10.md": {
	id: "2022-09-10.md";
  slug: "2022-09-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-11.md": {
	id: "2022-09-11.md";
  slug: "2022-09-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-12.md": {
	id: "2022-09-12.md";
  slug: "2022-09-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-13.md": {
	id: "2022-09-13.md";
  slug: "2022-09-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-14.md": {
	id: "2022-09-14.md";
  slug: "2022-09-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-15.md": {
	id: "2022-09-15.md";
  slug: "2022-09-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-16.md": {
	id: "2022-09-16.md";
  slug: "2022-09-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-17.md": {
	id: "2022-09-17.md";
  slug: "2022-09-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-18.md": {
	id: "2022-09-18.md";
  slug: "2022-09-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-19.md": {
	id: "2022-09-19.md";
  slug: "2022-09-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-20.md": {
	id: "2022-09-20.md";
  slug: "2022-09-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-21.md": {
	id: "2022-09-21.md";
  slug: "2022-09-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-22.md": {
	id: "2022-09-22.md";
  slug: "2022-09-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-23.md": {
	id: "2022-09-23.md";
  slug: "2022-09-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-24.md": {
	id: "2022-09-24.md";
  slug: "2022-09-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-25.md": {
	id: "2022-09-25.md";
  slug: "2022-09-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-26.md": {
	id: "2022-09-26.md";
  slug: "2022-09-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-27.md": {
	id: "2022-09-27.md";
  slug: "2022-09-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-28.md": {
	id: "2022-09-28.md";
  slug: "2022-09-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-29.md": {
	id: "2022-09-29.md";
  slug: "2022-09-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-09-30.md": {
	id: "2022-09-30.md";
  slug: "2022-09-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-01.md": {
	id: "2022-10-01.md";
  slug: "2022-10-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-02.md": {
	id: "2022-10-02.md";
  slug: "2022-10-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-03.md": {
	id: "2022-10-03.md";
  slug: "2022-10-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-07.md": {
	id: "2022-10-07.md";
  slug: "2022-10-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-08.md": {
	id: "2022-10-08.md";
  slug: "2022-10-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-09.md": {
	id: "2022-10-09.md";
  slug: "2022-10-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-10.md": {
	id: "2022-10-10.md";
  slug: "2022-10-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-11.md": {
	id: "2022-10-11.md";
  slug: "2022-10-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-12.md": {
	id: "2022-10-12.md";
  slug: "2022-10-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-13.md": {
	id: "2022-10-13.md";
  slug: "2022-10-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-14.md": {
	id: "2022-10-14.md";
  slug: "2022-10-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-15.md": {
	id: "2022-10-15.md";
  slug: "2022-10-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-16.md": {
	id: "2022-10-16.md";
  slug: "2022-10-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-17.md": {
	id: "2022-10-17.md";
  slug: "2022-10-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-18.md": {
	id: "2022-10-18.md";
  slug: "2022-10-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-19.md": {
	id: "2022-10-19.md";
  slug: "2022-10-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-20.md": {
	id: "2022-10-20.md";
  slug: "2022-10-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-21.md": {
	id: "2022-10-21.md";
  slug: "2022-10-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-22.md": {
	id: "2022-10-22.md";
  slug: "2022-10-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-23.md": {
	id: "2022-10-23.md";
  slug: "2022-10-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-24.md": {
	id: "2022-10-24.md";
  slug: "2022-10-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-25.md": {
	id: "2022-10-25.md";
  slug: "2022-10-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-26.md": {
	id: "2022-10-26.md";
  slug: "2022-10-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-27.md": {
	id: "2022-10-27.md";
  slug: "2022-10-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-28.md": {
	id: "2022-10-28.md";
  slug: "2022-10-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-29.md": {
	id: "2022-10-29.md";
  slug: "2022-10-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-30.md": {
	id: "2022-10-30.md";
  slug: "2022-10-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-10-31.md": {
	id: "2022-10-31.md";
  slug: "2022-10-31";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-01.md": {
	id: "2022-11-01.md";
  slug: "2022-11-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-02.md": {
	id: "2022-11-02.md";
  slug: "2022-11-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-03.md": {
	id: "2022-11-03.md";
  slug: "2022-11-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-04.md": {
	id: "2022-11-04.md";
  slug: "2022-11-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-05.md": {
	id: "2022-11-05.md";
  slug: "2022-11-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-06.md": {
	id: "2022-11-06.md";
  slug: "2022-11-06";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-07.md": {
	id: "2022-11-07.md";
  slug: "2022-11-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-08.md": {
	id: "2022-11-08.md";
  slug: "2022-11-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-09.md": {
	id: "2022-11-09.md";
  slug: "2022-11-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-10.md": {
	id: "2022-11-10.md";
  slug: "2022-11-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-11.md": {
	id: "2022-11-11.md";
  slug: "2022-11-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-12.md": {
	id: "2022-11-12.md";
  slug: "2022-11-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-13.md": {
	id: "2022-11-13.md";
  slug: "2022-11-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-14.md": {
	id: "2022-11-14.md";
  slug: "2022-11-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-15.md": {
	id: "2022-11-15.md";
  slug: "2022-11-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-16.md": {
	id: "2022-11-16.md";
  slug: "2022-11-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-17.md": {
	id: "2022-11-17.md";
  slug: "2022-11-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-19.md": {
	id: "2022-11-19.md";
  slug: "2022-11-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-20.md": {
	id: "2022-11-20.md";
  slug: "2022-11-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-21.md": {
	id: "2022-11-21.md";
  slug: "2022-11-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-22.md": {
	id: "2022-11-22.md";
  slug: "2022-11-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-23.md": {
	id: "2022-11-23.md";
  slug: "2022-11-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-24.md": {
	id: "2022-11-24.md";
  slug: "2022-11-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-25.md": {
	id: "2022-11-25.md";
  slug: "2022-11-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-26.md": {
	id: "2022-11-26.md";
  slug: "2022-11-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-27.md": {
	id: "2022-11-27.md";
  slug: "2022-11-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-28.md": {
	id: "2022-11-28.md";
  slug: "2022-11-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-29.md": {
	id: "2022-11-29.md";
  slug: "2022-11-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-11-30.md": {
	id: "2022-11-30.md";
  slug: "2022-11-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-01.md": {
	id: "2022-12-01.md";
  slug: "2022-12-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-02.md": {
	id: "2022-12-02.md";
  slug: "2022-12-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-12.md": {
	id: "2022-12-12.md";
  slug: "2022-12-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-16.md": {
	id: "2022-12-16.md";
  slug: "2022-12-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-17.md": {
	id: "2022-12-17.md";
  slug: "2022-12-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-18.md": {
	id: "2022-12-18.md";
  slug: "2022-12-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-21.md": {
	id: "2022-12-21.md";
  slug: "2022-12-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-27.md": {
	id: "2022-12-27.md";
  slug: "2022-12-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2022-12-28.md": {
	id: "2022-12-28.md";
  slug: "2022-12-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-03.md": {
	id: "2023-01-03.md";
  slug: "2023-01-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-04.md": {
	id: "2023-01-04.md";
  slug: "2023-01-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-07.md": {
	id: "2023-01-07.md";
  slug: "2023-01-07";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-08.md": {
	id: "2023-01-08.md";
  slug: "2023-01-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-09.md": {
	id: "2023-01-09.md";
  slug: "2023-01-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-10.md": {
	id: "2023-01-10.md";
  slug: "2023-01-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-11.md": {
	id: "2023-01-11.md";
  slug: "2023-01-11";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-12.md": {
	id: "2023-01-12.md";
  slug: "2023-01-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-13.md": {
	id: "2023-01-13.md";
  slug: "2023-01-13";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-14.md": {
	id: "2023-01-14.md";
  slug: "2023-01-14";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-15.md": {
	id: "2023-01-15.md";
  slug: "2023-01-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-24.md": {
	id: "2023-01-24.md";
  slug: "2023-01-24";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-01-29.md": {
	id: "2023-01-29.md";
  slug: "2023-01-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-02-01.md": {
	id: "2023-02-01.md";
  slug: "2023-02-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-03-05.md": {
	id: "2023-03-05.md";
  slug: "2023-03-05";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-19.md": {
	id: "2023-05-19.md";
  slug: "2023-05-19";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-20.md": {
	id: "2023-05-20.md";
  slug: "2023-05-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-21.md": {
	id: "2023-05-21.md";
  slug: "2023-05-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-22.md": {
	id: "2023-05-22.md";
  slug: "2023-05-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-23.md": {
	id: "2023-05-23.md";
  slug: "2023-05-23";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-25.md": {
	id: "2023-05-25.md";
  slug: "2023-05-25";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-05-27.md": {
	id: "2023-05-27.md";
  slug: "2023-05-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-06-01.md": {
	id: "2023-06-01.md";
  slug: "2023-06-01";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-06-12.md": {
	id: "2023-06-12.md";
  slug: "2023-06-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-06-20.md": {
	id: "2023-06-20.md";
  slug: "2023-06-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-07-04.md": {
	id: "2023-07-04.md";
  slug: "2023-07-04";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-08-20.md": {
	id: "2023-08-20.md";
  slug: "2023-08-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-08-26.md": {
	id: "2023-08-26.md";
  slug: "2023-08-26";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-09-10.md": {
	id: "2023-09-10.md";
  slug: "2023-09-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-09-12.md": {
	id: "2023-09-12.md";
  slug: "2023-09-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-09-18.md": {
	id: "2023-09-18.md";
  slug: "2023-09-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-09-21.md": {
	id: "2023-09-21.md";
  slug: "2023-09-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-09-27.md": {
	id: "2023-09-27.md";
  slug: "2023-09-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-02.md": {
	id: "2023-10-02.md";
  slug: "2023-10-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-03.md": {
	id: "2023-10-03.md";
  slug: "2023-10-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-08.md": {
	id: "2023-10-08.md";
  slug: "2023-10-08";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-09.md": {
	id: "2023-10-09.md";
  slug: "2023-10-09";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-10.md": {
	id: "2023-10-10.md";
  slug: "2023-10-10";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-16.md": {
	id: "2023-10-16.md";
  slug: "2023-10-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-18.md": {
	id: "2023-10-18.md";
  slug: "2023-10-18";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-20.md": {
	id: "2023-10-20.md";
  slug: "2023-10-20";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-22.md": {
	id: "2023-10-22.md";
  slug: "2023-10-22";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-27.md": {
	id: "2023-10-27.md";
  slug: "2023-10-27";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-10-30.md": {
	id: "2023-10-30.md";
  slug: "2023-10-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-11-02.md": {
	id: "2023-11-02.md";
  slug: "2023-11-02";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-11-12.md": {
	id: "2023-11-12.md";
  slug: "2023-11-12";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-11-16.md": {
	id: "2023-11-16.md";
  slug: "2023-11-16";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-11-17.md": {
	id: "2023-11-17.md";
  slug: "2023-11-17";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-12-03.md": {
	id: "2023-12-03.md";
  slug: "2023-12-03";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-12-15.md": {
	id: "2023-12-15.md";
  slug: "2023-12-15";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-12-21.md": {
	id: "2023-12-21.md";
  slug: "2023-12-21";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-12-28.md": {
	id: "2023-12-28.md";
  slug: "2023-12-28";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-12-29.md": {
	id: "2023-12-29.md";
  slug: "2023-12-29";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"2023-12-30.md": {
	id: "2023-12-30.md";
  slug: "2023-12-30";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
};
"literature-notes": {
"docker-basics.md": {
	id: "docker-basics.md";
  slug: "docker-basics";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
"does-edge-compute-replace-lambda-functions.md": {
	id: "does-edge-compute-replace-lambda-functions.md";
  slug: "does-edge-compute-replace-lambda-functions";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
"paypal-sdk.md": {
	id: "paypal-sdk.md";
  slug: "paypal-sdk";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
"threejs-journey.md": {
	id: "threejs-journey.md";
  slug: "threejs-journey";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
"total-typescript-notes.md": {
	id: "total-typescript-notes.md";
  slug: "total-typescript-notes";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
};
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
"learning.md": {
	id: "learning.md";
  slug: "learning";
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
"zettelkasten.md": {
	id: "zettelkasten.md";
  slug: "zettelkasten";
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
