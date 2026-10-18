import { Buffer } from "node:buffer";
import { z } from "zod";

import { readJsonObject } from "./http";

const REPOSITORY = "chiubaca/notes";
const BRANCH = "main";
const MAX_NOTE_BYTES = 128 * 1024;
const MAX_ATTEMPTS = 3;

export type NotesSecrets = { NOTES_GITHUB_TOKEN?: string };

export const fleetingNoteInputSchema = z
  .object({
    content: z
      .string()
      .min(1)
      .max(20_000)
      .refine((value) => value.trim().length > 0, "Content must not be blank")
      .describe("Markdown to save as a new entry. Existing content and frontmatter are preserved."),
    date: z.iso
      .date()
      .optional()
      .describe("Daily note date, YYYY-MM-DD. Defaults to today's UTC date."),
  })
  .strict();

const githubFileSchema = z.object({
  type: z.literal("file"),
  encoding: z.literal("base64"),
  sha: z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/),
  size: z.number().int().nonnegative().max(MAX_NOTE_BYTES),
  content: z.string(),
});

export class FleetingNoteError extends Error {}

async function readExistingNote(response: Response) {
  try {
    const file = githubFileSchema.parse(await readJsonObject(response, 256 * 1024));
    const encoded = file.content.replace(/\s/g, "");
    z.base64().parse(encoded);
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.byteLength !== file.size) throw new Error("Invalid file size");
    const content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    return { content, sha: file.sha };
  } catch {
    throw new FleetingNoteError(
      "The existing note was not modified: GitHub did not return a valid UTF-8 file within the 128 KiB limit.",
    );
  }
}

export async function addFleetingNote(env: NotesSecrets, input: unknown) {
  const args = fleetingNoteInputSchema.parse(input);
  const token = env.NOTES_GITHUB_TOKEN?.trim();
  if (!token)
    throw new FleetingNoteError(
      "Configure NOTES_GITHUB_TOKEN as a Cloudflare secret with Contents: read and write access to chiubaca/notes.",
    );

  const now = new Date().toISOString();
  const date = args.date ?? now.slice(0, 10);
  const path = `fleeting-notes/${date}.md`;
  const apiUrl = `https://api.github.com/repos/${REPOSITORY}/contents/${path}`;
  const url = `https://github.com/${REPOSITORY}/blob/${BRANCH}/${path}`;
  const entry = `## ${now.slice(11, 16)} UTC\n\n${args.content}\n`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "chiubaca-mcp",
    "X-GitHub-Api-Version": "2026-03-10",
  };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let read: Response;
    try {
      read = await fetch(`${apiUrl}?ref=${BRANCH}`, {
        headers,
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new FleetingNoteError(
        "Could not read the daily note from GitHub. No write was attempted.",
      );
    }
    let existing: Awaited<ReturnType<typeof readExistingNote>> | undefined;
    if (read.status === 200) {
      existing = await readExistingNote(read);
    } else {
      await read.body?.cancel();
      if (read.status !== 404)
        throw new FleetingNoteError(
          `Could not read the daily note (GitHub HTTP ${read.status}). Check NOTES_GITHUB_TOKEN permissions and GitHub availability. No write was attempted.`,
        );
    }

    const prefix = existing?.content ?? `---\ntags:\n  - fleeting\npublish_date: ${date}\n---\n\n`;
    const separator = prefix.endsWith("\n\n") ? "" : prefix.endsWith("\n") ? "\n" : "\n\n";
    const content = Buffer.from(`${prefix}${separator}${entry}`, "utf8");
    if (content.byteLength > MAX_NOTE_BYTES)
      throw new FleetingNoteError(
        "The note would exceed the 128 KiB limit. No write was attempted.",
      );

    let write: Response;
    try {
      write = await fetch(apiUrl, {
        method: "PUT",
        headers,
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          message: `Add fleeting note entry for ${date}`,
          branch: BRANCH,
          content: content.toString("base64"),
          ...(existing ? { sha: existing.sha } : {}),
        }),
      });
    } catch {
      throw new FleetingNoteError(
        `GitHub's write status is unknown. Check the note before retrying to avoid duplicates: ${url}`,
      );
    }
    await write.body?.cancel();
    if (write.status === 200 || write.status === 201) {
      return { action: existing ? ("appended" as const) : ("created" as const), date, path, url };
    }
    // These conflicts did not save our entry. Reread rather than overwriting concurrent changes.
    if (write.status === 409 || (!existing && write.status === 422)) continue;
    throw new FleetingNoteError(
      `GitHub could not confirm saving the note (HTTP ${write.status}). Check the note before retrying: ${url}`,
    );
  }
  throw new FleetingNoteError(
    "The daily note kept changing during the update. Please retry once other edits have finished.",
  );
}
