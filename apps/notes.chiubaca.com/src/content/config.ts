// 1. Import utilities from `astro:content`
import { defineCollection } from "astro:content";
import z from "astro/zod";
import { noteTypes } from "@shared/types";

const publish_date = z
  .union([z.string(), z.date()])
  .transform((d) => new Date(d));

const tags = z
  .array(z.string())
  .optional()
  .transform((tags) => (tags ? tags : []));

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
    publish_date,
    title: z.string(),
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
