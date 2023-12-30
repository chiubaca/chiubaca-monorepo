// 1. Import utilities from `astro:content`
import { defineCollection } from "astro:content";
import z from "astro/zod";
import { noteTypes } from "@shared/zod-schemas";
import { publish_date, tags } from "@shared/zod-schemas";

const fleetingNoteCollection = defineCollection({
  type: "content",
  schema: z.object({
    publish_date,
    tags,
  }),
});

const noteCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publish_date,
    tags,
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  [noteTypes.enum["fleeting-notes"]]: fleetingNoteCollection,
  [noteTypes.enum["literature-notes"]]: noteCollection,
  [noteTypes.enum["permanent-notes"]]: noteCollection,
};
