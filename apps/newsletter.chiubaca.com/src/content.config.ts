import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const date = z.union([z.string(), z.date()]).transform((d) => new Date(d));

const newsletter = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./newsletter" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    pubDate: date,
    updatedDate: date.optional().nullable(),
    issue: z.number(),
    status: z.enum(["draft", "live"]).optional().default("live"),
    tags: z.array(z.string()).optional().default(["newsletter"]),
  }),
});

export const collections = { newsletter };
