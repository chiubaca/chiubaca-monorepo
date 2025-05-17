import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const permanentNotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./permanent-notes" }),
  schema: z.object({
    title: z.string(),
    publish_date: z.date(),
    last_updated: z.date(),
    description: z.string().nullable().optional(),
    status: z.enum(["draft", "live"]),
    tags: z.array(z.string()),
  }),
});

const fleetingNotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./fleeting-notes" }),
  schema: z.object({
    publish_date: z.date(),
    tags: z.array(z.string()),
  }),
});

export const collections = { permanentNotes, fleetingNotes };
