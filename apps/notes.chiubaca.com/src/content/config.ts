// 1. Import utilities from `astro:content`
import { defineCollection } from "astro:content";
import z from "astro/zod";
import { noteTypes } from "../common/types";

const noteCollection = defineCollection({
  type: "content",
  schema: z.object({
    publish_date: z.string().transform((d) => new Date(d)),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  [noteTypes.enum["fleeting-notes"]]: noteCollection,
  [noteTypes.enum["index-notes"]]: noteCollection,
  [noteTypes.enum["literature-notes"]]: noteCollection,
  [noteTypes.enum["permanent-notes"]]: noteCollection,
};
