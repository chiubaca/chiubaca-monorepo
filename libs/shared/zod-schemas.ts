import { z } from "astro/zod";

export const noteTypes = z.enum([
  "fleeting-notes",
  "literature-notes",
  "permanent-notes",
]);

export const publish_date = z
  .union([z.string(), z.date()])
  .transform((d) => new Date(d));

export const tags = z
  .array(z.string())
  .optional()
  .transform((tags) => (tags ? tags : ["uncategorised"]));
