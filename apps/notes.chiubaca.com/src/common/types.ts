
import { z } from "astro/zod";

export const noteTypes =  z.enum(["fleeting-notes", "index-notes", "literature-notes", "permanent-notes"]);