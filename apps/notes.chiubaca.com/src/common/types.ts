
import { z } from "astro/zod";

export type NoteTypes = z.infer<typeof noteTypes>;
export const noteTypes =  z.enum(["fleeting-notes", "index-notes", "literature-notes", "permanent-notes"]);

export type PossiblePaths = NoteTypes | `${NoteTypes}/${string}`
