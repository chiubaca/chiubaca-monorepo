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
"20200910.md": {
	id: "20200910.md";
  slug: "20200910";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200911.md": {
	id: "20200911.md";
  slug: "20200911";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200912.md": {
	id: "20200912.md";
  slug: "20200912";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200913.md": {
	id: "20200913.md";
  slug: "20200913";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200914.md": {
	id: "20200914.md";
  slug: "20200914";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200915.md": {
	id: "20200915.md";
  slug: "20200915";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200916.md": {
	id: "20200916.md";
  slug: "20200916";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200917.md": {
	id: "20200917.md";
  slug: "20200917";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200918.md": {
	id: "20200918.md";
  slug: "20200918";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200919.md": {
	id: "20200919.md";
  slug: "20200919";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200920.md": {
	id: "20200920.md";
  slug: "20200920";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200922.md": {
	id: "20200922.md";
  slug: "20200922";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200923.md": {
	id: "20200923.md";
  slug: "20200923";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200924.md": {
	id: "20200924.md";
  slug: "20200924";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200925.md": {
	id: "20200925.md";
  slug: "20200925";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200926.md": {
	id: "20200926.md";
  slug: "20200926";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200927.md": {
	id: "20200927.md";
  slug: "20200927";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200928.md": {
	id: "20200928.md";
  slug: "20200928";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200929.md": {
	id: "20200929.md";
  slug: "20200929";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20200930.md": {
	id: "20200930.md";
  slug: "20200930";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201001.md": {
	id: "20201001.md";
  slug: "20201001";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201002.md": {
	id: "20201002.md";
  slug: "20201002";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201003.md": {
	id: "20201003.md";
  slug: "20201003";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201004.md": {
	id: "20201004.md";
  slug: "20201004";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201005.md": {
	id: "20201005.md";
  slug: "20201005";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201006.md": {
	id: "20201006.md";
  slug: "20201006";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201007.md": {
	id: "20201007.md";
  slug: "20201007";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201008.md": {
	id: "20201008.md";
  slug: "20201008";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201009.md": {
	id: "20201009.md";
  slug: "20201009";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201010.md": {
	id: "20201010.md";
  slug: "20201010";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201011.md": {
	id: "20201011.md";
  slug: "20201011";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201012.md": {
	id: "20201012.md";
  slug: "20201012";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201013.md": {
	id: "20201013.md";
  slug: "20201013";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201014.md": {
	id: "20201014.md";
  slug: "20201014";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201015.md": {
	id: "20201015.md";
  slug: "20201015";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201016.md": {
	id: "20201016.md";
  slug: "20201016";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201017.md": {
	id: "20201017.md";
  slug: "20201017";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201018.md": {
	id: "20201018.md";
  slug: "20201018";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201019.md": {
	id: "20201019.md";
  slug: "20201019";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201020.md": {
	id: "20201020.md";
  slug: "20201020";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201021.md": {
	id: "20201021.md";
  slug: "20201021";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201022.md": {
	id: "20201022.md";
  slug: "20201022";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201023.md": {
	id: "20201023.md";
  slug: "20201023";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201024.md": {
	id: "20201024.md";
  slug: "20201024";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201025.md": {
	id: "20201025.md";
  slug: "20201025";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201026.md": {
	id: "20201026.md";
  slug: "20201026";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201027.md": {
	id: "20201027.md";
  slug: "20201027";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201028.md": {
	id: "20201028.md";
  slug: "20201028";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201029.md": {
	id: "20201029.md";
  slug: "20201029";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201030.md": {
	id: "20201030.md";
  slug: "20201030";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201031.md": {
	id: "20201031.md";
  slug: "20201031";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201101.md": {
	id: "20201101.md";
  slug: "20201101";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201102.md": {
	id: "20201102.md";
  slug: "20201102";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201103.md": {
	id: "20201103.md";
  slug: "20201103";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201104.md": {
	id: "20201104.md";
  slug: "20201104";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201105.md": {
	id: "20201105.md";
  slug: "20201105";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201106.md": {
	id: "20201106.md";
  slug: "20201106";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201107.md": {
	id: "20201107.md";
  slug: "20201107";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201108.md": {
	id: "20201108.md";
  slug: "20201108";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201109.md": {
	id: "20201109.md";
  slug: "20201109";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201110.md": {
	id: "20201110.md";
  slug: "20201110";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201111.md": {
	id: "20201111.md";
  slug: "20201111";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201112.md": {
	id: "20201112.md";
  slug: "20201112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201113.md": {
	id: "20201113.md";
  slug: "20201113";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201114.md": {
	id: "20201114.md";
  slug: "20201114";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201115.md": {
	id: "20201115.md";
  slug: "20201115";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201116.md": {
	id: "20201116.md";
  slug: "20201116";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201117.md": {
	id: "20201117.md";
  slug: "20201117";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201118.md": {
	id: "20201118.md";
  slug: "20201118";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201119.md": {
	id: "20201119.md";
  slug: "20201119";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201120.md": {
	id: "20201120.md";
  slug: "20201120";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201121.md": {
	id: "20201121.md";
  slug: "20201121";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201122.md": {
	id: "20201122.md";
  slug: "20201122";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201123.md": {
	id: "20201123.md";
  slug: "20201123";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201124.md": {
	id: "20201124.md";
  slug: "20201124";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201125.md": {
	id: "20201125.md";
  slug: "20201125";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201126.md": {
	id: "20201126.md";
  slug: "20201126";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201127.md": {
	id: "20201127.md";
  slug: "20201127";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201128.md": {
	id: "20201128.md";
  slug: "20201128";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201129.md": {
	id: "20201129.md";
  slug: "20201129";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201130.md": {
	id: "20201130.md";
  slug: "20201130";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201201.md": {
	id: "20201201.md";
  slug: "20201201";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201202.md": {
	id: "20201202.md";
  slug: "20201202";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201203.md": {
	id: "20201203.md";
  slug: "20201203";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201204.md": {
	id: "20201204.md";
  slug: "20201204";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201205.md": {
	id: "20201205.md";
  slug: "20201205";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201206.md": {
	id: "20201206.md";
  slug: "20201206";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201207.md": {
	id: "20201207.md";
  slug: "20201207";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201208.md": {
	id: "20201208.md";
  slug: "20201208";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201209.md": {
	id: "20201209.md";
  slug: "20201209";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201210.md": {
	id: "20201210.md";
  slug: "20201210";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201211.md": {
	id: "20201211.md";
  slug: "20201211";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201212.md": {
	id: "20201212.md";
  slug: "20201212";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201213.md": {
	id: "20201213.md";
  slug: "20201213";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201214.md": {
	id: "20201214.md";
  slug: "20201214";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201215.md": {
	id: "20201215.md";
  slug: "20201215";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201216.md": {
	id: "20201216.md";
  slug: "20201216";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201217.md": {
	id: "20201217.md";
  slug: "20201217";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201218.md": {
	id: "20201218.md";
  slug: "20201218";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201219.md": {
	id: "20201219.md";
  slug: "20201219";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201220.md": {
	id: "20201220.md";
  slug: "20201220";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201221.md": {
	id: "20201221.md";
  slug: "20201221";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201222.md": {
	id: "20201222.md";
  slug: "20201222";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201223.md": {
	id: "20201223.md";
  slug: "20201223";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201224.md": {
	id: "20201224.md";
  slug: "20201224";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201225.md": {
	id: "20201225.md";
  slug: "20201225";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201226.md": {
	id: "20201226.md";
  slug: "20201226";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201227.md": {
	id: "20201227.md";
  slug: "20201227";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201228.md": {
	id: "20201228.md";
  slug: "20201228";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201229.md": {
	id: "20201229.md";
  slug: "20201229";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201230.md": {
	id: "20201230.md";
  slug: "20201230";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20201231.md": {
	id: "20201231.md";
  slug: "20201231";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210101.md": {
	id: "20210101.md";
  slug: "20210101";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210102.md": {
	id: "20210102.md";
  slug: "20210102";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210103.md": {
	id: "20210103.md";
  slug: "20210103";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210104.md": {
	id: "20210104.md";
  slug: "20210104";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210105.md": {
	id: "20210105.md";
  slug: "20210105";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210106.md": {
	id: "20210106.md";
  slug: "20210106";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210107.md": {
	id: "20210107.md";
  slug: "20210107";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210108.md": {
	id: "20210108.md";
  slug: "20210108";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210109.md": {
	id: "20210109.md";
  slug: "20210109";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210110.md": {
	id: "20210110.md";
  slug: "20210110";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210111.md": {
	id: "20210111.md";
  slug: "20210111";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210112.md": {
	id: "20210112.md";
  slug: "20210112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210113.md": {
	id: "20210113.md";
  slug: "20210113";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210114.md": {
	id: "20210114.md";
  slug: "20210114";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210115.md": {
	id: "20210115.md";
  slug: "20210115";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210116.md": {
	id: "20210116.md";
  slug: "20210116";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210117.md": {
	id: "20210117.md";
  slug: "20210117";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210118.md": {
	id: "20210118.md";
  slug: "20210118";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210119.md": {
	id: "20210119.md";
  slug: "20210119";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210120.md": {
	id: "20210120.md";
  slug: "20210120";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210121.md": {
	id: "20210121.md";
  slug: "20210121";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210122.md": {
	id: "20210122.md";
  slug: "20210122";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210123.md": {
	id: "20210123.md";
  slug: "20210123";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210124.md": {
	id: "20210124.md";
  slug: "20210124";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210125.md": {
	id: "20210125.md";
  slug: "20210125";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210126.md": {
	id: "20210126.md";
  slug: "20210126";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210127.md": {
	id: "20210127.md";
  slug: "20210127";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210128.md": {
	id: "20210128.md";
  slug: "20210128";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210129.md": {
	id: "20210129.md";
  slug: "20210129";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210130.md": {
	id: "20210130.md";
  slug: "20210130";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210131.md": {
	id: "20210131.md";
  slug: "20210131";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210201.md": {
	id: "20210201.md";
  slug: "20210201";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210202.md": {
	id: "20210202.md";
  slug: "20210202";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210203.md": {
	id: "20210203.md";
  slug: "20210203";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210204.md": {
	id: "20210204.md";
  slug: "20210204";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210205.md": {
	id: "20210205.md";
  slug: "20210205";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210206.md": {
	id: "20210206.md";
  slug: "20210206";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210207.md": {
	id: "20210207.md";
  slug: "20210207";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210208.md": {
	id: "20210208.md";
  slug: "20210208";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210209.md": {
	id: "20210209.md";
  slug: "20210209";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210210.md": {
	id: "20210210.md";
  slug: "20210210";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210211.md": {
	id: "20210211.md";
  slug: "20210211";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210212.md": {
	id: "20210212.md";
  slug: "20210212";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210213.md": {
	id: "20210213.md";
  slug: "20210213";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210214.md": {
	id: "20210214.md";
  slug: "20210214";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210215.md": {
	id: "20210215.md";
  slug: "20210215";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210216.md": {
	id: "20210216.md";
  slug: "20210216";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210217.md": {
	id: "20210217.md";
  slug: "20210217";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210218.md": {
	id: "20210218.md";
  slug: "20210218";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210219.md": {
	id: "20210219.md";
  slug: "20210219";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210220.md": {
	id: "20210220.md";
  slug: "20210220";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210221.md": {
	id: "20210221.md";
  slug: "20210221";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210222.md": {
	id: "20210222.md";
  slug: "20210222";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210223.md": {
	id: "20210223.md";
  slug: "20210223";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210224.md": {
	id: "20210224.md";
  slug: "20210224";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210225.md": {
	id: "20210225.md";
  slug: "20210225";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210226.md": {
	id: "20210226.md";
  slug: "20210226";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210227.md": {
	id: "20210227.md";
  slug: "20210227";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210228.md": {
	id: "20210228.md";
  slug: "20210228";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210301.md": {
	id: "20210301.md";
  slug: "20210301";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210302.md": {
	id: "20210302.md";
  slug: "20210302";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210303.md": {
	id: "20210303.md";
  slug: "20210303";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210304.md": {
	id: "20210304.md";
  slug: "20210304";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210305.md": {
	id: "20210305.md";
  slug: "20210305";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210306.md": {
	id: "20210306.md";
  slug: "20210306";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210307.md": {
	id: "20210307.md";
  slug: "20210307";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210308.md": {
	id: "20210308.md";
  slug: "20210308";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210309.md": {
	id: "20210309.md";
  slug: "20210309";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210310.md": {
	id: "20210310.md";
  slug: "20210310";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210311.md": {
	id: "20210311.md";
  slug: "20210311";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210312.md": {
	id: "20210312.md";
  slug: "20210312";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210313.md": {
	id: "20210313.md";
  slug: "20210313";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210314.md": {
	id: "20210314.md";
  slug: "20210314";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210315.md": {
	id: "20210315.md";
  slug: "20210315";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210316.md": {
	id: "20210316.md";
  slug: "20210316";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210317.md": {
	id: "20210317.md";
  slug: "20210317";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210318.md": {
	id: "20210318.md";
  slug: "20210318";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210319.md": {
	id: "20210319.md";
  slug: "20210319";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210320.md": {
	id: "20210320.md";
  slug: "20210320";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210321.md": {
	id: "20210321.md";
  slug: "20210321";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210322.md": {
	id: "20210322.md";
  slug: "20210322";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210323.md": {
	id: "20210323.md";
  slug: "20210323";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210324.md": {
	id: "20210324.md";
  slug: "20210324";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210325.md": {
	id: "20210325.md";
  slug: "20210325";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210326.md": {
	id: "20210326.md";
  slug: "20210326";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210327.md": {
	id: "20210327.md";
  slug: "20210327";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210328.md": {
	id: "20210328.md";
  slug: "20210328";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210329.md": {
	id: "20210329.md";
  slug: "20210329";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210330.md": {
	id: "20210330.md";
  slug: "20210330";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210331.md": {
	id: "20210331.md";
  slug: "20210331";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210401.md": {
	id: "20210401.md";
  slug: "20210401";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210402.md": {
	id: "20210402.md";
  slug: "20210402";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210403.md": {
	id: "20210403.md";
  slug: "20210403";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210404.md": {
	id: "20210404.md";
  slug: "20210404";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210405.md": {
	id: "20210405.md";
  slug: "20210405";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210406.md": {
	id: "20210406.md";
  slug: "20210406";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210407.md": {
	id: "20210407.md";
  slug: "20210407";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210408.md": {
	id: "20210408.md";
  slug: "20210408";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210409.md": {
	id: "20210409.md";
  slug: "20210409";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210410.md": {
	id: "20210410.md";
  slug: "20210410";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210411.md": {
	id: "20210411.md";
  slug: "20210411";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210412.md": {
	id: "20210412.md";
  slug: "20210412";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210413.md": {
	id: "20210413.md";
  slug: "20210413";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210414.md": {
	id: "20210414.md";
  slug: "20210414";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210415.md": {
	id: "20210415.md";
  slug: "20210415";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210416.md": {
	id: "20210416.md";
  slug: "20210416";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210417.md": {
	id: "20210417.md";
  slug: "20210417";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210418.md": {
	id: "20210418.md";
  slug: "20210418";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210419.md": {
	id: "20210419.md";
  slug: "20210419";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210420.md": {
	id: "20210420.md";
  slug: "20210420";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210421.md": {
	id: "20210421.md";
  slug: "20210421";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210422.md": {
	id: "20210422.md";
  slug: "20210422";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210423.md": {
	id: "20210423.md";
  slug: "20210423";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210424.md": {
	id: "20210424.md";
  slug: "20210424";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210425.md": {
	id: "20210425.md";
  slug: "20210425";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210426.md": {
	id: "20210426.md";
  slug: "20210426";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210427.md": {
	id: "20210427.md";
  slug: "20210427";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210428.md": {
	id: "20210428.md";
  slug: "20210428";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210429.md": {
	id: "20210429.md";
  slug: "20210429";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210430.md": {
	id: "20210430.md";
  slug: "20210430";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210501.md": {
	id: "20210501.md";
  slug: "20210501";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210502.md": {
	id: "20210502.md";
  slug: "20210502";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210503.md": {
	id: "20210503.md";
  slug: "20210503";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210504.md": {
	id: "20210504.md";
  slug: "20210504";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210505.md": {
	id: "20210505.md";
  slug: "20210505";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210506.md": {
	id: "20210506.md";
  slug: "20210506";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210507.md": {
	id: "20210507.md";
  slug: "20210507";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210508.md": {
	id: "20210508.md";
  slug: "20210508";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210509.md": {
	id: "20210509.md";
  slug: "20210509";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210510.md": {
	id: "20210510.md";
  slug: "20210510";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210511.md": {
	id: "20210511.md";
  slug: "20210511";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210512.md": {
	id: "20210512.md";
  slug: "20210512";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210513.md": {
	id: "20210513.md";
  slug: "20210513";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210514.md": {
	id: "20210514.md";
  slug: "20210514";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210515.md": {
	id: "20210515.md";
  slug: "20210515";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210516.md": {
	id: "20210516.md";
  slug: "20210516";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210517.md": {
	id: "20210517.md";
  slug: "20210517";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210518.md": {
	id: "20210518.md";
  slug: "20210518";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210519.md": {
	id: "20210519.md";
  slug: "20210519";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210520.md": {
	id: "20210520.md";
  slug: "20210520";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210521.md": {
	id: "20210521.md";
  slug: "20210521";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210522.md": {
	id: "20210522.md";
  slug: "20210522";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210523.md": {
	id: "20210523.md";
  slug: "20210523";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210524.md": {
	id: "20210524.md";
  slug: "20210524";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210525.md": {
	id: "20210525.md";
  slug: "20210525";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210526.md": {
	id: "20210526.md";
  slug: "20210526";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210527.md": {
	id: "20210527.md";
  slug: "20210527";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210528.md": {
	id: "20210528.md";
  slug: "20210528";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210529.md": {
	id: "20210529.md";
  slug: "20210529";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210530.md": {
	id: "20210530.md";
  slug: "20210530";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210531.md": {
	id: "20210531.md";
  slug: "20210531";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210601.md": {
	id: "20210601.md";
  slug: "20210601";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210602.md": {
	id: "20210602.md";
  slug: "20210602";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210603.md": {
	id: "20210603.md";
  slug: "20210603";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210604.md": {
	id: "20210604.md";
  slug: "20210604";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210605.md": {
	id: "20210605.md";
  slug: "20210605";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210606.md": {
	id: "20210606.md";
  slug: "20210606";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210607.md": {
	id: "20210607.md";
  slug: "20210607";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210608.md": {
	id: "20210608.md";
  slug: "20210608";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210609.md": {
	id: "20210609.md";
  slug: "20210609";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210610.md": {
	id: "20210610.md";
  slug: "20210610";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210611.md": {
	id: "20210611.md";
  slug: "20210611";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210612.md": {
	id: "20210612.md";
  slug: "20210612";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210613.md": {
	id: "20210613.md";
  slug: "20210613";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210614.md": {
	id: "20210614.md";
  slug: "20210614";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210615.md": {
	id: "20210615.md";
  slug: "20210615";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210616.md": {
	id: "20210616.md";
  slug: "20210616";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210617.md": {
	id: "20210617.md";
  slug: "20210617";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210618.md": {
	id: "20210618.md";
  slug: "20210618";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210619.md": {
	id: "20210619.md";
  slug: "20210619";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210620.md": {
	id: "20210620.md";
  slug: "20210620";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210621.md": {
	id: "20210621.md";
  slug: "20210621";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210622.md": {
	id: "20210622.md";
  slug: "20210622";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210623.md": {
	id: "20210623.md";
  slug: "20210623";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210624.md": {
	id: "20210624.md";
  slug: "20210624";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210625.md": {
	id: "20210625.md";
  slug: "20210625";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210626.md": {
	id: "20210626.md";
  slug: "20210626";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210627.md": {
	id: "20210627.md";
  slug: "20210627";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210628.md": {
	id: "20210628.md";
  slug: "20210628";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210629.md": {
	id: "20210629.md";
  slug: "20210629";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210630.md": {
	id: "20210630.md";
  slug: "20210630";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210701.md": {
	id: "20210701.md";
  slug: "20210701";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210702.md": {
	id: "20210702.md";
  slug: "20210702";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210703.md": {
	id: "20210703.md";
  slug: "20210703";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210704.md": {
	id: "20210704.md";
  slug: "20210704";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210705.md": {
	id: "20210705.md";
  slug: "20210705";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210706.md": {
	id: "20210706.md";
  slug: "20210706";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210707.md": {
	id: "20210707.md";
  slug: "20210707";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210708.md": {
	id: "20210708.md";
  slug: "20210708";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210709.md": {
	id: "20210709.md";
  slug: "20210709";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210710.md": {
	id: "20210710.md";
  slug: "20210710";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210711.md": {
	id: "20210711.md";
  slug: "20210711";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210712.md": {
	id: "20210712.md";
  slug: "20210712";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210713.md": {
	id: "20210713.md";
  slug: "20210713";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210714.md": {
	id: "20210714.md";
  slug: "20210714";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210715.md": {
	id: "20210715.md";
  slug: "20210715";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210716.md": {
	id: "20210716.md";
  slug: "20210716";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210717.md": {
	id: "20210717.md";
  slug: "20210717";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210718.md": {
	id: "20210718.md";
  slug: "20210718";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210719.md": {
	id: "20210719.md";
  slug: "20210719";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210720.md": {
	id: "20210720.md";
  slug: "20210720";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210721.md": {
	id: "20210721.md";
  slug: "20210721";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210722.md": {
	id: "20210722.md";
  slug: "20210722";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210723.md": {
	id: "20210723.md";
  slug: "20210723";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210724.md": {
	id: "20210724.md";
  slug: "20210724";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210725.md": {
	id: "20210725.md";
  slug: "20210725";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210726.md": {
	id: "20210726.md";
  slug: "20210726";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210727.md": {
	id: "20210727.md";
  slug: "20210727";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210728.md": {
	id: "20210728.md";
  slug: "20210728";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210729.md": {
	id: "20210729.md";
  slug: "20210729";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210730.md": {
	id: "20210730.md";
  slug: "20210730";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210731.md": {
	id: "20210731.md";
  slug: "20210731";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210801.md": {
	id: "20210801.md";
  slug: "20210801";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210802.md": {
	id: "20210802.md";
  slug: "20210802";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210803.md": {
	id: "20210803.md";
  slug: "20210803";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210804.md": {
	id: "20210804.md";
  slug: "20210804";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210805.md": {
	id: "20210805.md";
  slug: "20210805";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210806.md": {
	id: "20210806.md";
  slug: "20210806";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210807.md": {
	id: "20210807.md";
  slug: "20210807";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210808.md": {
	id: "20210808.md";
  slug: "20210808";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210809.md": {
	id: "20210809.md";
  slug: "20210809";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210810.md": {
	id: "20210810.md";
  slug: "20210810";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210811.md": {
	id: "20210811.md";
  slug: "20210811";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210812.md": {
	id: "20210812.md";
  slug: "20210812";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210813.md": {
	id: "20210813.md";
  slug: "20210813";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210814.md": {
	id: "20210814.md";
  slug: "20210814";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210815.md": {
	id: "20210815.md";
  slug: "20210815";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210816.md": {
	id: "20210816.md";
  slug: "20210816";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210817.md": {
	id: "20210817.md";
  slug: "20210817";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210818.md": {
	id: "20210818.md";
  slug: "20210818";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210819.md": {
	id: "20210819.md";
  slug: "20210819";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210820.md": {
	id: "20210820.md";
  slug: "20210820";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210821.md": {
	id: "20210821.md";
  slug: "20210821";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210822.md": {
	id: "20210822.md";
  slug: "20210822";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210823.md": {
	id: "20210823.md";
  slug: "20210823";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210824.md": {
	id: "20210824.md";
  slug: "20210824";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210825.md": {
	id: "20210825.md";
  slug: "20210825";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210826.md": {
	id: "20210826.md";
  slug: "20210826";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210827.md": {
	id: "20210827.md";
  slug: "20210827";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210828.md": {
	id: "20210828.md";
  slug: "20210828";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210829.md": {
	id: "20210829.md";
  slug: "20210829";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210830.md": {
	id: "20210830.md";
  slug: "20210830";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210831.md": {
	id: "20210831.md";
  slug: "20210831";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210901.md": {
	id: "20210901.md";
  slug: "20210901";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210902.md": {
	id: "20210902.md";
  slug: "20210902";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210903.md": {
	id: "20210903.md";
  slug: "20210903";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210904.md": {
	id: "20210904.md";
  slug: "20210904";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210905.md": {
	id: "20210905.md";
  slug: "20210905";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210906.md": {
	id: "20210906.md";
  slug: "20210906";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210907.md": {
	id: "20210907.md";
  slug: "20210907";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210908.md": {
	id: "20210908.md";
  slug: "20210908";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210909.md": {
	id: "20210909.md";
  slug: "20210909";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210910.md": {
	id: "20210910.md";
  slug: "20210910";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210911.md": {
	id: "20210911.md";
  slug: "20210911";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210912.md": {
	id: "20210912.md";
  slug: "20210912";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210913.md": {
	id: "20210913.md";
  slug: "20210913";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210914.md": {
	id: "20210914.md";
  slug: "20210914";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210915.md": {
	id: "20210915.md";
  slug: "20210915";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210916.md": {
	id: "20210916.md";
  slug: "20210916";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210917.md": {
	id: "20210917.md";
  slug: "20210917";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210918.md": {
	id: "20210918.md";
  slug: "20210918";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210919.md": {
	id: "20210919.md";
  slug: "20210919";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210920.md": {
	id: "20210920.md";
  slug: "20210920";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210921.md": {
	id: "20210921.md";
  slug: "20210921";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210922.md": {
	id: "20210922.md";
  slug: "20210922";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210923.md": {
	id: "20210923.md";
  slug: "20210923";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210924.md": {
	id: "20210924.md";
  slug: "20210924";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210925.md": {
	id: "20210925.md";
  slug: "20210925";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210926.md": {
	id: "20210926.md";
  slug: "20210926";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210927.md": {
	id: "20210927.md";
  slug: "20210927";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210928.md": {
	id: "20210928.md";
  slug: "20210928";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210929.md": {
	id: "20210929.md";
  slug: "20210929";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20210930.md": {
	id: "20210930.md";
  slug: "20210930";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211001.md": {
	id: "20211001.md";
  slug: "20211001";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211002.md": {
	id: "20211002.md";
  slug: "20211002";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211003.md": {
	id: "20211003.md";
  slug: "20211003";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211004.md": {
	id: "20211004.md";
  slug: "20211004";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211005.md": {
	id: "20211005.md";
  slug: "20211005";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211006.md": {
	id: "20211006.md";
  slug: "20211006";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211007.md": {
	id: "20211007.md";
  slug: "20211007";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211008.md": {
	id: "20211008.md";
  slug: "20211008";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211009.md": {
	id: "20211009.md";
  slug: "20211009";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211010.md": {
	id: "20211010.md";
  slug: "20211010";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211011.md": {
	id: "20211011.md";
  slug: "20211011";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211012.md": {
	id: "20211012.md";
  slug: "20211012";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211013.md": {
	id: "20211013.md";
  slug: "20211013";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211014.md": {
	id: "20211014.md";
  slug: "20211014";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211015.md": {
	id: "20211015.md";
  slug: "20211015";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211016.md": {
	id: "20211016.md";
  slug: "20211016";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211017.md": {
	id: "20211017.md";
  slug: "20211017";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211018.md": {
	id: "20211018.md";
  slug: "20211018";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211019.md": {
	id: "20211019.md";
  slug: "20211019";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211020.md": {
	id: "20211020.md";
  slug: "20211020";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211021.md": {
	id: "20211021.md";
  slug: "20211021";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211022.md": {
	id: "20211022.md";
  slug: "20211022";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211023.md": {
	id: "20211023.md";
  slug: "20211023";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211024.md": {
	id: "20211024.md";
  slug: "20211024";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211025.md": {
	id: "20211025.md";
  slug: "20211025";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211026.md": {
	id: "20211026.md";
  slug: "20211026";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211027.md": {
	id: "20211027.md";
  slug: "20211027";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211028.md": {
	id: "20211028.md";
  slug: "20211028";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211029.md": {
	id: "20211029.md";
  slug: "20211029";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211030.md": {
	id: "20211030.md";
  slug: "20211030";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211031.md": {
	id: "20211031.md";
  slug: "20211031";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211101.md": {
	id: "20211101.md";
  slug: "20211101";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211102.md": {
	id: "20211102.md";
  slug: "20211102";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211103.md": {
	id: "20211103.md";
  slug: "20211103";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211104.md": {
	id: "20211104.md";
  slug: "20211104";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211105.md": {
	id: "20211105.md";
  slug: "20211105";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211106.md": {
	id: "20211106.md";
  slug: "20211106";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211107.md": {
	id: "20211107.md";
  slug: "20211107";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211108.md": {
	id: "20211108.md";
  slug: "20211108";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211109.md": {
	id: "20211109.md";
  slug: "20211109";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211110.md": {
	id: "20211110.md";
  slug: "20211110";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211111.md": {
	id: "20211111.md";
  slug: "20211111";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211112.md": {
	id: "20211112.md";
  slug: "20211112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211113.md": {
	id: "20211113.md";
  slug: "20211113";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211114.md": {
	id: "20211114.md";
  slug: "20211114";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211115.md": {
	id: "20211115.md";
  slug: "20211115";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211116.md": {
	id: "20211116.md";
  slug: "20211116";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211117.md": {
	id: "20211117.md";
  slug: "20211117";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211118.md": {
	id: "20211118.md";
  slug: "20211118";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211119.md": {
	id: "20211119.md";
  slug: "20211119";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211120.md": {
	id: "20211120.md";
  slug: "20211120";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211121.md": {
	id: "20211121.md";
  slug: "20211121";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211122.md": {
	id: "20211122.md";
  slug: "20211122";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211123.md": {
	id: "20211123.md";
  slug: "20211123";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211124.md": {
	id: "20211124.md";
  slug: "20211124";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211125.md": {
	id: "20211125.md";
  slug: "20211125";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211126.md": {
	id: "20211126.md";
  slug: "20211126";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211127.md": {
	id: "20211127.md";
  slug: "20211127";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211128.md": {
	id: "20211128.md";
  slug: "20211128";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211129.md": {
	id: "20211129.md";
  slug: "20211129";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211130.md": {
	id: "20211130.md";
  slug: "20211130";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211201.md": {
	id: "20211201.md";
  slug: "20211201";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211202.md": {
	id: "20211202.md";
  slug: "20211202";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211203.md": {
	id: "20211203.md";
  slug: "20211203";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211204.md": {
	id: "20211204.md";
  slug: "20211204";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211205.md": {
	id: "20211205.md";
  slug: "20211205";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211206.md": {
	id: "20211206.md";
  slug: "20211206";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211207.md": {
	id: "20211207.md";
  slug: "20211207";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211208.md": {
	id: "20211208.md";
  slug: "20211208";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211209.md": {
	id: "20211209.md";
  slug: "20211209";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211210.md": {
	id: "20211210.md";
  slug: "20211210";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211211.md": {
	id: "20211211.md";
  slug: "20211211";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211212.md": {
	id: "20211212.md";
  slug: "20211212";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211213.md": {
	id: "20211213.md";
  slug: "20211213";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211214.md": {
	id: "20211214.md";
  slug: "20211214";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211215.md": {
	id: "20211215.md";
  slug: "20211215";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211216.md": {
	id: "20211216.md";
  slug: "20211216";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211217.md": {
	id: "20211217.md";
  slug: "20211217";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211218.md": {
	id: "20211218.md";
  slug: "20211218";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211219.md": {
	id: "20211219.md";
  slug: "20211219";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211220.md": {
	id: "20211220.md";
  slug: "20211220";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211221.md": {
	id: "20211221.md";
  slug: "20211221";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211222.md": {
	id: "20211222.md";
  slug: "20211222";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211223.md": {
	id: "20211223.md";
  slug: "20211223";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211224.md": {
	id: "20211224.md";
  slug: "20211224";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211225.md": {
	id: "20211225.md";
  slug: "20211225";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211226.md": {
	id: "20211226.md";
  slug: "20211226";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211227.md": {
	id: "20211227.md";
  slug: "20211227";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211228.md": {
	id: "20211228.md";
  slug: "20211228";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211229.md": {
	id: "20211229.md";
  slug: "20211229";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211230.md": {
	id: "20211230.md";
  slug: "20211230";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20211231.md": {
	id: "20211231.md";
  slug: "20211231";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220101.md": {
	id: "20220101.md";
  slug: "20220101";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220102.md": {
	id: "20220102.md";
  slug: "20220102";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220103.md": {
	id: "20220103.md";
  slug: "20220103";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220104.md": {
	id: "20220104.md";
  slug: "20220104";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220105.md": {
	id: "20220105.md";
  slug: "20220105";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220106.md": {
	id: "20220106.md";
  slug: "20220106";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220107.md": {
	id: "20220107.md";
  slug: "20220107";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220108.md": {
	id: "20220108.md";
  slug: "20220108";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220109.md": {
	id: "20220109.md";
  slug: "20220109";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220110.md": {
	id: "20220110.md";
  slug: "20220110";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220111.md": {
	id: "20220111.md";
  slug: "20220111";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220112.md": {
	id: "20220112.md";
  slug: "20220112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220113.md": {
	id: "20220113.md";
  slug: "20220113";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220114.md": {
	id: "20220114.md";
  slug: "20220114";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220115.md": {
	id: "20220115.md";
  slug: "20220115";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220116.md": {
	id: "20220116.md";
  slug: "20220116";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220117.md": {
	id: "20220117.md";
  slug: "20220117";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220118.md": {
	id: "20220118.md";
  slug: "20220118";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220119.md": {
	id: "20220119.md";
  slug: "20220119";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220120.md": {
	id: "20220120.md";
  slug: "20220120";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220121.md": {
	id: "20220121.md";
  slug: "20220121";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220122.md": {
	id: "20220122.md";
  slug: "20220122";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220123.md": {
	id: "20220123.md";
  slug: "20220123";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220124.md": {
	id: "20220124.md";
  slug: "20220124";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220125.md": {
	id: "20220125.md";
  slug: "20220125";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220126.md": {
	id: "20220126.md";
  slug: "20220126";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220127.md": {
	id: "20220127.md";
  slug: "20220127";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220128.md": {
	id: "20220128.md";
  slug: "20220128";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220129.md": {
	id: "20220129.md";
  slug: "20220129";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220130.md": {
	id: "20220130.md";
  slug: "20220130";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220131.md": {
	id: "20220131.md";
  slug: "20220131";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220201.md": {
	id: "20220201.md";
  slug: "20220201";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220202.md": {
	id: "20220202.md";
  slug: "20220202";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220203.md": {
	id: "20220203.md";
  slug: "20220203";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220204.md": {
	id: "20220204.md";
  slug: "20220204";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220205.md": {
	id: "20220205.md";
  slug: "20220205";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220206.md": {
	id: "20220206.md";
  slug: "20220206";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220207.md": {
	id: "20220207.md";
  slug: "20220207";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220208.md": {
	id: "20220208.md";
  slug: "20220208";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220209.md": {
	id: "20220209.md";
  slug: "20220209";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220210.md": {
	id: "20220210.md";
  slug: "20220210";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220211.md": {
	id: "20220211.md";
  slug: "20220211";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220212.md": {
	id: "20220212.md";
  slug: "20220212";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220213.md": {
	id: "20220213.md";
  slug: "20220213";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220214.md": {
	id: "20220214.md";
  slug: "20220214";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220215.md": {
	id: "20220215.md";
  slug: "20220215";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220216.md": {
	id: "20220216.md";
  slug: "20220216";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220217.md": {
	id: "20220217.md";
  slug: "20220217";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220218.md": {
	id: "20220218.md";
  slug: "20220218";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220219.md": {
	id: "20220219.md";
  slug: "20220219";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220220.md": {
	id: "20220220.md";
  slug: "20220220";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220221.md": {
	id: "20220221.md";
  slug: "20220221";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220222.md": {
	id: "20220222.md";
  slug: "20220222";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220223.md": {
	id: "20220223.md";
  slug: "20220223";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220224.md": {
	id: "20220224.md";
  slug: "20220224";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220225.md": {
	id: "20220225.md";
  slug: "20220225";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220226.md": {
	id: "20220226.md";
  slug: "20220226";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220227.md": {
	id: "20220227.md";
  slug: "20220227";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220228.md": {
	id: "20220228.md";
  slug: "20220228";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220301.md": {
	id: "20220301.md";
  slug: "20220301";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220302.md": {
	id: "20220302.md";
  slug: "20220302";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220303.md": {
	id: "20220303.md";
  slug: "20220303";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220304.md": {
	id: "20220304.md";
  slug: "20220304";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220305.md": {
	id: "20220305.md";
  slug: "20220305";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220306.md": {
	id: "20220306.md";
  slug: "20220306";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220307.md": {
	id: "20220307.md";
  slug: "20220307";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220308.md": {
	id: "20220308.md";
  slug: "20220308";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220309.md": {
	id: "20220309.md";
  slug: "20220309";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220310.md": {
	id: "20220310.md";
  slug: "20220310";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220311.md": {
	id: "20220311.md";
  slug: "20220311";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220312.md": {
	id: "20220312.md";
  slug: "20220312";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220313.md": {
	id: "20220313.md";
  slug: "20220313";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220314.md": {
	id: "20220314.md";
  slug: "20220314";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220315.md": {
	id: "20220315.md";
  slug: "20220315";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220316.md": {
	id: "20220316.md";
  slug: "20220316";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220317.md": {
	id: "20220317.md";
  slug: "20220317";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220318.md": {
	id: "20220318.md";
  slug: "20220318";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220319.md": {
	id: "20220319.md";
  slug: "20220319";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220320.md": {
	id: "20220320.md";
  slug: "20220320";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220321.md": {
	id: "20220321.md";
  slug: "20220321";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220322.md": {
	id: "20220322.md";
  slug: "20220322";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220323.md": {
	id: "20220323.md";
  slug: "20220323";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220324.md": {
	id: "20220324.md";
  slug: "20220324";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220325.md": {
	id: "20220325.md";
  slug: "20220325";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220326.md": {
	id: "20220326.md";
  slug: "20220326";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220327.md": {
	id: "20220327.md";
  slug: "20220327";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220328.md": {
	id: "20220328.md";
  slug: "20220328";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220329.md": {
	id: "20220329.md";
  slug: "20220329";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220330.md": {
	id: "20220330.md";
  slug: "20220330";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220331.md": {
	id: "20220331.md";
  slug: "20220331";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220401.md": {
	id: "20220401.md";
  slug: "20220401";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220402.md": {
	id: "20220402.md";
  slug: "20220402";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220403.md": {
	id: "20220403.md";
  slug: "20220403";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220404.md": {
	id: "20220404.md";
  slug: "20220404";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220405.md": {
	id: "20220405.md";
  slug: "20220405";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220406.md": {
	id: "20220406.md";
  slug: "20220406";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220407.md": {
	id: "20220407.md";
  slug: "20220407";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220408.md": {
	id: "20220408.md";
  slug: "20220408";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220409.md": {
	id: "20220409.md";
  slug: "20220409";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220410.md": {
	id: "20220410.md";
  slug: "20220410";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220411.md": {
	id: "20220411.md";
  slug: "20220411";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220412.md": {
	id: "20220412.md";
  slug: "20220412";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220413.md": {
	id: "20220413.md";
  slug: "20220413";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220414.md": {
	id: "20220414.md";
  slug: "20220414";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220415.md": {
	id: "20220415.md";
  slug: "20220415";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220416.md": {
	id: "20220416.md";
  slug: "20220416";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220417.md": {
	id: "20220417.md";
  slug: "20220417";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220418.md": {
	id: "20220418.md";
  slug: "20220418";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220419.md": {
	id: "20220419.md";
  slug: "20220419";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220420.md": {
	id: "20220420.md";
  slug: "20220420";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220421.md": {
	id: "20220421.md";
  slug: "20220421";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220422.md": {
	id: "20220422.md";
  slug: "20220422";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220423.md": {
	id: "20220423.md";
  slug: "20220423";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220424.md": {
	id: "20220424.md";
  slug: "20220424";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220425.md": {
	id: "20220425.md";
  slug: "20220425";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220426.md": {
	id: "20220426.md";
  slug: "20220426";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220427.md": {
	id: "20220427.md";
  slug: "20220427";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220428.md": {
	id: "20220428.md";
  slug: "20220428";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220429.md": {
	id: "20220429.md";
  slug: "20220429";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220430.md": {
	id: "20220430.md";
  slug: "20220430";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220501.md": {
	id: "20220501.md";
  slug: "20220501";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220502.md": {
	id: "20220502.md";
  slug: "20220502";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220503.md": {
	id: "20220503.md";
  slug: "20220503";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220504.md": {
	id: "20220504.md";
  slug: "20220504";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220505.md": {
	id: "20220505.md";
  slug: "20220505";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220506.md": {
	id: "20220506.md";
  slug: "20220506";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220507.md": {
	id: "20220507.md";
  slug: "20220507";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220508.md": {
	id: "20220508.md";
  slug: "20220508";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220509.md": {
	id: "20220509.md";
  slug: "20220509";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220510.md": {
	id: "20220510.md";
  slug: "20220510";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220511.md": {
	id: "20220511.md";
  slug: "20220511";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220512.md": {
	id: "20220512.md";
  slug: "20220512";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220513.md": {
	id: "20220513.md";
  slug: "20220513";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220514.md": {
	id: "20220514.md";
  slug: "20220514";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220515.md": {
	id: "20220515.md";
  slug: "20220515";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220516.md": {
	id: "20220516.md";
  slug: "20220516";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220517.md": {
	id: "20220517.md";
  slug: "20220517";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220518.md": {
	id: "20220518.md";
  slug: "20220518";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220519.md": {
	id: "20220519.md";
  slug: "20220519";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220520.md": {
	id: "20220520.md";
  slug: "20220520";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220521.md": {
	id: "20220521.md";
  slug: "20220521";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220522.md": {
	id: "20220522.md";
  slug: "20220522";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220523.md": {
	id: "20220523.md";
  slug: "20220523";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220524.md": {
	id: "20220524.md";
  slug: "20220524";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220525.md": {
	id: "20220525.md";
  slug: "20220525";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220526.md": {
	id: "20220526.md";
  slug: "20220526";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220527.md": {
	id: "20220527.md";
  slug: "20220527";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220528.md": {
	id: "20220528.md";
  slug: "20220528";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220529.md": {
	id: "20220529.md";
  slug: "20220529";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220530.md": {
	id: "20220530.md";
  slug: "20220530";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220531.md": {
	id: "20220531.md";
  slug: "20220531";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220601.md": {
	id: "20220601.md";
  slug: "20220601";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220602.md": {
	id: "20220602.md";
  slug: "20220602";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220603.md": {
	id: "20220603.md";
  slug: "20220603";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220604.md": {
	id: "20220604.md";
  slug: "20220604";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220605.md": {
	id: "20220605.md";
  slug: "20220605";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220606.md": {
	id: "20220606.md";
  slug: "20220606";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220607.md": {
	id: "20220607.md";
  slug: "20220607";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220608.md": {
	id: "20220608.md";
  slug: "20220608";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220609.md": {
	id: "20220609.md";
  slug: "20220609";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220610.md": {
	id: "20220610.md";
  slug: "20220610";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220611.md": {
	id: "20220611.md";
  slug: "20220611";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220612.md": {
	id: "20220612.md";
  slug: "20220612";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220613.md": {
	id: "20220613.md";
  slug: "20220613";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220614.md": {
	id: "20220614.md";
  slug: "20220614";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220615.md": {
	id: "20220615.md";
  slug: "20220615";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220616.md": {
	id: "20220616.md";
  slug: "20220616";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220617.md": {
	id: "20220617.md";
  slug: "20220617";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220618.md": {
	id: "20220618.md";
  slug: "20220618";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220619.md": {
	id: "20220619.md";
  slug: "20220619";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220620.md": {
	id: "20220620.md";
  slug: "20220620";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220621.md": {
	id: "20220621.md";
  slug: "20220621";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220622.md": {
	id: "20220622.md";
  slug: "20220622";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220623.md": {
	id: "20220623.md";
  slug: "20220623";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220624.md": {
	id: "20220624.md";
  slug: "20220624";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220625.md": {
	id: "20220625.md";
  slug: "20220625";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220626.md": {
	id: "20220626.md";
  slug: "20220626";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220627.md": {
	id: "20220627.md";
  slug: "20220627";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220628.md": {
	id: "20220628.md";
  slug: "20220628";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220629.md": {
	id: "20220629.md";
  slug: "20220629";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220630.md": {
	id: "20220630.md";
  slug: "20220630";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220701.md": {
	id: "20220701.md";
  slug: "20220701";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220702.md": {
	id: "20220702.md";
  slug: "20220702";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220703.md": {
	id: "20220703.md";
  slug: "20220703";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220704.md": {
	id: "20220704.md";
  slug: "20220704";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220705.md": {
	id: "20220705.md";
  slug: "20220705";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220706.md": {
	id: "20220706.md";
  slug: "20220706";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220707.md": {
	id: "20220707.md";
  slug: "20220707";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220708.md": {
	id: "20220708.md";
  slug: "20220708";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220709.md": {
	id: "20220709.md";
  slug: "20220709";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220710.md": {
	id: "20220710.md";
  slug: "20220710";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220711.md": {
	id: "20220711.md";
  slug: "20220711";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220712.md": {
	id: "20220712.md";
  slug: "20220712";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220713.md": {
	id: "20220713.md";
  slug: "20220713";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220714.md": {
	id: "20220714.md";
  slug: "20220714";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220715.md": {
	id: "20220715.md";
  slug: "20220715";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220716.md": {
	id: "20220716.md";
  slug: "20220716";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220717.md": {
	id: "20220717.md";
  slug: "20220717";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220718.md": {
	id: "20220718.md";
  slug: "20220718";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220719.md": {
	id: "20220719.md";
  slug: "20220719";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220720.md": {
	id: "20220720.md";
  slug: "20220720";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220721.md": {
	id: "20220721.md";
  slug: "20220721";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220722.md": {
	id: "20220722.md";
  slug: "20220722";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220723.md": {
	id: "20220723.md";
  slug: "20220723";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220724.md": {
	id: "20220724.md";
  slug: "20220724";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220725.md": {
	id: "20220725.md";
  slug: "20220725";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220726.md": {
	id: "20220726.md";
  slug: "20220726";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220727.md": {
	id: "20220727.md";
  slug: "20220727";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220728.md": {
	id: "20220728.md";
  slug: "20220728";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220729.md": {
	id: "20220729.md";
  slug: "20220729";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220730.md": {
	id: "20220730.md";
  slug: "20220730";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220731.md": {
	id: "20220731.md";
  slug: "20220731";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220801.md": {
	id: "20220801.md";
  slug: "20220801";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220802.md": {
	id: "20220802.md";
  slug: "20220802";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220803.md": {
	id: "20220803.md";
  slug: "20220803";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220804.md": {
	id: "20220804.md";
  slug: "20220804";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220805.md": {
	id: "20220805.md";
  slug: "20220805";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220806.md": {
	id: "20220806.md";
  slug: "20220806";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220807.md": {
	id: "20220807.md";
  slug: "20220807";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220808.md": {
	id: "20220808.md";
  slug: "20220808";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220809.md": {
	id: "20220809.md";
  slug: "20220809";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220810.md": {
	id: "20220810.md";
  slug: "20220810";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220811.md": {
	id: "20220811.md";
  slug: "20220811";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220812.md": {
	id: "20220812.md";
  slug: "20220812";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220813.md": {
	id: "20220813.md";
  slug: "20220813";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220814.md": {
	id: "20220814.md";
  slug: "20220814";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220815.md": {
	id: "20220815.md";
  slug: "20220815";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220816.md": {
	id: "20220816.md";
  slug: "20220816";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220817.md": {
	id: "20220817.md";
  slug: "20220817";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220818.md": {
	id: "20220818.md";
  slug: "20220818";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220819.md": {
	id: "20220819.md";
  slug: "20220819";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220820.md": {
	id: "20220820.md";
  slug: "20220820";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220821.md": {
	id: "20220821.md";
  slug: "20220821";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220822.md": {
	id: "20220822.md";
  slug: "20220822";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220823.md": {
	id: "20220823.md";
  slug: "20220823";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220824.md": {
	id: "20220824.md";
  slug: "20220824";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220825.md": {
	id: "20220825.md";
  slug: "20220825";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220826.md": {
	id: "20220826.md";
  slug: "20220826";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220827.md": {
	id: "20220827.md";
  slug: "20220827";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220828.md": {
	id: "20220828.md";
  slug: "20220828";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220829.md": {
	id: "20220829.md";
  slug: "20220829";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220830.md": {
	id: "20220830.md";
  slug: "20220830";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220831.md": {
	id: "20220831.md";
  slug: "20220831";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220901.md": {
	id: "20220901.md";
  slug: "20220901";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220902.md": {
	id: "20220902.md";
  slug: "20220902";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220903.md": {
	id: "20220903.md";
  slug: "20220903";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220904.md": {
	id: "20220904.md";
  slug: "20220904";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220905.md": {
	id: "20220905.md";
  slug: "20220905";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220906.md": {
	id: "20220906.md";
  slug: "20220906";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220907.md": {
	id: "20220907.md";
  slug: "20220907";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220908.md": {
	id: "20220908.md";
  slug: "20220908";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220909.md": {
	id: "20220909.md";
  slug: "20220909";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220910.md": {
	id: "20220910.md";
  slug: "20220910";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220911.md": {
	id: "20220911.md";
  slug: "20220911";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220912.md": {
	id: "20220912.md";
  slug: "20220912";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220913.md": {
	id: "20220913.md";
  slug: "20220913";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220914.md": {
	id: "20220914.md";
  slug: "20220914";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220915.md": {
	id: "20220915.md";
  slug: "20220915";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220916.md": {
	id: "20220916.md";
  slug: "20220916";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220917.md": {
	id: "20220917.md";
  slug: "20220917";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220918.md": {
	id: "20220918.md";
  slug: "20220918";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220919.md": {
	id: "20220919.md";
  slug: "20220919";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220920.md": {
	id: "20220920.md";
  slug: "20220920";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220921.md": {
	id: "20220921.md";
  slug: "20220921";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220922.md": {
	id: "20220922.md";
  slug: "20220922";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220923.md": {
	id: "20220923.md";
  slug: "20220923";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220924.md": {
	id: "20220924.md";
  slug: "20220924";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220925.md": {
	id: "20220925.md";
  slug: "20220925";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220926.md": {
	id: "20220926.md";
  slug: "20220926";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220927.md": {
	id: "20220927.md";
  slug: "20220927";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220928.md": {
	id: "20220928.md";
  slug: "20220928";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220929.md": {
	id: "20220929.md";
  slug: "20220929";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20220930.md": {
	id: "20220930.md";
  slug: "20220930";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221001.md": {
	id: "20221001.md";
  slug: "20221001";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221002.md": {
	id: "20221002.md";
  slug: "20221002";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221003.md": {
	id: "20221003.md";
  slug: "20221003";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221007.md": {
	id: "20221007.md";
  slug: "20221007";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221008.md": {
	id: "20221008.md";
  slug: "20221008";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221009.md": {
	id: "20221009.md";
  slug: "20221009";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221010.md": {
	id: "20221010.md";
  slug: "20221010";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221011.md": {
	id: "20221011.md";
  slug: "20221011";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221012.md": {
	id: "20221012.md";
  slug: "20221012";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221013.md": {
	id: "20221013.md";
  slug: "20221013";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221014.md": {
	id: "20221014.md";
  slug: "20221014";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221015.md": {
	id: "20221015.md";
  slug: "20221015";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221016.md": {
	id: "20221016.md";
  slug: "20221016";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221017.md": {
	id: "20221017.md";
  slug: "20221017";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221018.md": {
	id: "20221018.md";
  slug: "20221018";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221019.md": {
	id: "20221019.md";
  slug: "20221019";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221020.md": {
	id: "20221020.md";
  slug: "20221020";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221021.md": {
	id: "20221021.md";
  slug: "20221021";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221022.md": {
	id: "20221022.md";
  slug: "20221022";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221023.md": {
	id: "20221023.md";
  slug: "20221023";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221024.md": {
	id: "20221024.md";
  slug: "20221024";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221025.md": {
	id: "20221025.md";
  slug: "20221025";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221026.md": {
	id: "20221026.md";
  slug: "20221026";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221027.md": {
	id: "20221027.md";
  slug: "20221027";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221028.md": {
	id: "20221028.md";
  slug: "20221028";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221029.md": {
	id: "20221029.md";
  slug: "20221029";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221030.md": {
	id: "20221030.md";
  slug: "20221030";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221031.md": {
	id: "20221031.md";
  slug: "20221031";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221101.md": {
	id: "20221101.md";
  slug: "20221101";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221102.md": {
	id: "20221102.md";
  slug: "20221102";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221103.md": {
	id: "20221103.md";
  slug: "20221103";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221104.md": {
	id: "20221104.md";
  slug: "20221104";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221105.md": {
	id: "20221105.md";
  slug: "20221105";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221106.md": {
	id: "20221106.md";
  slug: "20221106";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221107.md": {
	id: "20221107.md";
  slug: "20221107";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221108.md": {
	id: "20221108.md";
  slug: "20221108";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221109.md": {
	id: "20221109.md";
  slug: "20221109";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221110.md": {
	id: "20221110.md";
  slug: "20221110";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221111.md": {
	id: "20221111.md";
  slug: "20221111";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221112.md": {
	id: "20221112.md";
  slug: "20221112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221113.md": {
	id: "20221113.md";
  slug: "20221113";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221114.md": {
	id: "20221114.md";
  slug: "20221114";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221115.md": {
	id: "20221115.md";
  slug: "20221115";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221116.md": {
	id: "20221116.md";
  slug: "20221116";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221117.md": {
	id: "20221117.md";
  slug: "20221117";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221118.md": {
	id: "20221118.md";
  slug: "20221118";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221119.md": {
	id: "20221119.md";
  slug: "20221119";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221120.md": {
	id: "20221120.md";
  slug: "20221120";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221121.md": {
	id: "20221121.md";
  slug: "20221121";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221122.md": {
	id: "20221122.md";
  slug: "20221122";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221123.md": {
	id: "20221123.md";
  slug: "20221123";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221124.md": {
	id: "20221124.md";
  slug: "20221124";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221125.md": {
	id: "20221125.md";
  slug: "20221125";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221126.md": {
	id: "20221126.md";
  slug: "20221126";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221127.md": {
	id: "20221127.md";
  slug: "20221127";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221128.md": {
	id: "20221128.md";
  slug: "20221128";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221129.md": {
	id: "20221129.md";
  slug: "20221129";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221130.md": {
	id: "20221130.md";
  slug: "20221130";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221201.md": {
	id: "20221201.md";
  slug: "20221201";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221202.md": {
	id: "20221202.md";
  slug: "20221202";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221212.md": {
	id: "20221212.md";
  slug: "20221212";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221216.md": {
	id: "20221216.md";
  slug: "20221216";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221217.md": {
	id: "20221217.md";
  slug: "20221217";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221218.md": {
	id: "20221218.md";
  slug: "20221218";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221221.md": {
	id: "20221221.md";
  slug: "20221221";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221227.md": {
	id: "20221227.md";
  slug: "20221227";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20221228.md": {
	id: "20221228.md";
  slug: "20221228";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230103.md": {
	id: "20230103.md";
  slug: "20230103";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230104.md": {
	id: "20230104.md";
  slug: "20230104";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230107.md": {
	id: "20230107.md";
  slug: "20230107";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230108.md": {
	id: "20230108.md";
  slug: "20230108";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230109.md": {
	id: "20230109.md";
  slug: "20230109";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230110.md": {
	id: "20230110.md";
  slug: "20230110";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230111.md": {
	id: "20230111.md";
  slug: "20230111";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230112.md": {
	id: "20230112.md";
  slug: "20230112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230113.md": {
	id: "20230113.md";
  slug: "20230113";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230114.md": {
	id: "20230114.md";
  slug: "20230114";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230115.md": {
	id: "20230115.md";
  slug: "20230115";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230124.md": {
	id: "20230124.md";
  slug: "20230124";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230129.md": {
	id: "20230129.md";
  slug: "20230129";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230201.md": {
	id: "20230201.md";
  slug: "20230201";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230305.md": {
	id: "20230305.md";
  slug: "20230305";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230519.md": {
	id: "20230519.md";
  slug: "20230519";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230520.md": {
	id: "20230520.md";
  slug: "20230520";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230521.md": {
	id: "20230521.md";
  slug: "20230521";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230522.md": {
	id: "20230522.md";
  slug: "20230522";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230523.md": {
	id: "20230523.md";
  slug: "20230523";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230525.md": {
	id: "20230525.md";
  slug: "20230525";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230527.md": {
	id: "20230527.md";
  slug: "20230527";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230601.md": {
	id: "20230601.md";
  slug: "20230601";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230612.md": {
	id: "20230612.md";
  slug: "20230612";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230620.md": {
	id: "20230620.md";
  slug: "20230620";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230704.md": {
	id: "20230704.md";
  slug: "20230704";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230820.md": {
	id: "20230820.md";
  slug: "20230820";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230826.md": {
	id: "20230826.md";
  slug: "20230826";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230910.md": {
	id: "20230910.md";
  slug: "20230910";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230912.md": {
	id: "20230912.md";
  slug: "20230912";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230918.md": {
	id: "20230918.md";
  slug: "20230918";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230921.md": {
	id: "20230921.md";
  slug: "20230921";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20230927.md": {
	id: "20230927.md";
  slug: "20230927";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231002.md": {
	id: "20231002.md";
  slug: "20231002";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231003.md": {
	id: "20231003.md";
  slug: "20231003";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231008.md": {
	id: "20231008.md";
  slug: "20231008";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231009.md": {
	id: "20231009.md";
  slug: "20231009";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231010.md": {
	id: "20231010.md";
  slug: "20231010";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231016.md": {
	id: "20231016.md";
  slug: "20231016";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231017.md": {
	id: "20231017.md";
  slug: "20231017";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231018.md": {
	id: "20231018.md";
  slug: "20231018";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231019.md": {
	id: "20231019.md";
  slug: "20231019";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231020.md": {
	id: "20231020.md";
  slug: "20231020";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231021.md": {
	id: "20231021.md";
  slug: "20231021";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231022.md": {
	id: "20231022.md";
  slug: "20231022";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231023.md": {
	id: "20231023.md";
  slug: "20231023";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231024.md": {
	id: "20231024.md";
  slug: "20231024";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231025.md": {
	id: "20231025.md";
  slug: "20231025";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231026.md": {
	id: "20231026.md";
  slug: "20231026";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231027.md": {
	id: "20231027.md";
  slug: "20231027";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231030.md": {
	id: "20231030.md";
  slug: "20231030";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231102.md": {
	id: "20231102.md";
  slug: "20231102";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231112.md": {
	id: "20231112.md";
  slug: "20231112";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231116.md": {
	id: "20231116.md";
  slug: "20231116";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231117.md": {
	id: "20231117.md";
  slug: "20231117";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231203.md": {
	id: "20231203.md";
  slug: "20231203";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231215.md": {
	id: "20231215.md";
  slug: "20231215";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231219.md": {
	id: "20231219.md";
  slug: "20231219";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
"20231221.md": {
	id: "20231221.md";
  slug: "20231221";
  body: string;
  collection: "fleeting-notes";
  data: InferEntrySchema<"fleeting-notes">
} & { render(): Render[".md"] };
};
"index-notes": {
"Astro.md": {
	id: "Astro.md";
  slug: "astro";
  body: string;
  collection: "index-notes";
  data: InferEntrySchema<"index-notes">
} & { render(): Render[".md"] };
"Business Ideas.md": {
	id: "Business Ideas.md";
  slug: "business-ideas";
  body: string;
  collection: "index-notes";
  data: InferEntrySchema<"index-notes">
} & { render(): Render[".md"] };
"Svelte.md": {
	id: "Svelte.md";
  slug: "svelte";
  body: string;
  collection: "index-notes";
  data: InferEntrySchema<"index-notes">
} & { render(): Render[".md"] };
"Three-js.md": {
	id: "Three-js.md";
  slug: "three-js";
  body: string;
  collection: "index-notes";
  data: InferEntrySchema<"index-notes">
} & { render(): Render[".md"] };
"Zettelkasten.md": {
	id: "Zettelkasten.md";
  slug: "zettelkasten";
  body: string;
  collection: "index-notes";
  data: InferEntrySchema<"index-notes">
} & { render(): Render[".md"] };
};
"literature-notes": {
"all-things-vector-tiles.md": {
	id: "all-things-vector-tiles.md";
  slug: "all-things-vector-tiles";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
"building-a-headless-dropshipping-site.md": {
	id: "building-a-headless-dropshipping-site.md";
  slug: "building-a-headless-dropshipping-site";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
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
"making-eco-friendly-websites.md": {
	id: "making-eco-friendly-websites.md";
  slug: "making-eco-friendly-websites";
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
"zettelkasten-smart-notes-step-by-step-with-obsidian.md": {
	id: "zettelkasten-smart-notes-step-by-step-with-obsidian.md";
  slug: "zettelkasten-smart-notes-step-by-step-with-obsidian";
  body: string;
  collection: "literature-notes";
  data: InferEntrySchema<"literature-notes">
} & { render(): Render[".md"] };
};
"permanent-notes": {
"Quick look at`use()`. The hook that solves React client-side data fetching..md": {
	id: "Quick look at`use()`. The hook that solves React client-side data fetching..md";
  slug: "quick-look-atuse-the-hook-that-solves-react-client-side-data-fetching";
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
"holograpic-cards-tilt-effect.md": {
	id: "holograpic-cards-tilt-effect.md";
  slug: "holograpic-cards-tilt-effect";
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
"nextjs-vs-remix.md": {
	id: "nextjs-vs-remix.md";
  slug: "nextjs-vs-remix";
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
"remix-basics.md": {
	id: "remix-basics.md";
  slug: "remix-basics";
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
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
