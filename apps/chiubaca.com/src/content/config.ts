// 1. Import utilities from `astro:content`
import { defineCollection } from "astro:content";
import z from "astro/zod";
import { noteTypes, date, tags } from "@shared/zod-schemas";

const noteCollection = defineCollection({
  type: "content",
  schema: z.object({
    publish_date: date,
    last_updated: date,
    title: z.string(),
    description: z.string().nullable().optional(),
    status: z.enum(["draft", "live"]),
    tags,
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  [noteTypes.enum["permanent-notes"]]: noteCollection,
};
