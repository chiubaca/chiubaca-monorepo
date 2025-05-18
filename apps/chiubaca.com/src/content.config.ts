import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

export const date = z
  .union([z.string(), z.date()])
  .transform((d) => new Date(d));

export const tags = z
  .array(z.string())
  .optional()
  .transform((tags) => (tags ? tags : ["uncategorised"]));

const permanentNotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./permanent-notes" }),
  schema: z.object({
    title: z.string(),
    publish_date: date,
    last_updated: date,
    description: z.string().nullable().optional(),
    status: z.enum(["draft", "live"]),
    tags: tags,
  }),
});

const fleetingNotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./fleeting-notes" }),
  schema: z.object({
    publish_date: date,
    tags: tags,
  }),
});

export const collections = { permanentNotes, fleetingNotes };
