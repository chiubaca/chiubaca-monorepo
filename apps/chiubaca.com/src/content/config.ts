// 1. Import utilities from `astro:content`
import { defineCollection } from "astro:content";
import z from "astro/zod";
import { noteTypes } from "@shared/types";

const noteCollection = defineCollection({
  type: "content",
  schema: z.object({
    publish_date: z.union([z.string(), z.date()]).transform((d) => new Date(d)),
    title: z.string(),
    status: z.enum(["draft", "live"]),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  [noteTypes.enum["permanent-notes"]]: noteCollection,
};
