import { Buffer } from "node:buffer";
import { z } from "zod";

import { readJsonObject } from "./http";
import type { NotesSecrets } from "./fleeting-notes";

const REPOSITORY = "chiubaca/notes";
const BRANCH = "main";
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export const attachmentInputSchema = z
  .object({
    filename: z
      .string()
      .min(1)
      .max(255)
      .describe("Filename with a supported image extension (e.g. screenshot.png)."),
    data: z.string().min(1).describe("Base64-encoded image bytes."),
    alt: z.string().max(500).optional().describe("Alt text for the markdown image reference."),
  })
  .strict();

export class AttachmentError extends Error {}

function extension(filename: string): string {
  return (filename.match(/\.[^.]+$/)?.[0] ?? "").toLowerCase();
}

function sanitizeFilename(filename: string): string {
  const base = filename.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!base || base === ".") return "image.png";
  return base;
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "chiubaca-mcp",
    "X-GitHub-Api-Version": "2026-03-10",
  };
}

const githubFileSchema = z.object({
  type: z.literal("file"),
  encoding: z.literal("base64"),
  sha: z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/),
  size: z.number().int().nonnegative(),
  content: z.string(),
});

async function existingSha(
  path: string,
  headers: Record<string, string>,
): Promise<string | undefined> {
  const read = await fetch(
    `https://api.github.com/repos/${REPOSITORY}/contents/${path}?ref=${BRANCH}`,
    {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (read.status === 404) {
    await read.body?.cancel();
    return undefined;
  }
  if (!read.ok) {
    const text = await read.text().catch(() => "");
    throw new AttachmentError(
      `Could not check for existing attachment (GitHub HTTP ${read.status}). ${text}`,
    );
  }
  try {
    const file = githubFileSchema.parse(await readJsonObject(read, 256 * 1024));
    return file.sha;
  } catch {
    throw new AttachmentError(
      "GitHub returned an unexpected response when checking for an existing attachment.",
    );
  }
}

export async function addAttachment(env: NotesSecrets, input: unknown) {
  const args = attachmentInputSchema.parse(input);
  const token = env.NOTES_GITHUB_TOKEN?.trim();
  if (!token)
    throw new AttachmentError(
      "Configure NOTES_GITHUB_TOKEN as a Cloudflare secret with Contents: read and write access to chiubaca/notes.",
    );

  const ext = extension(args.filename);
  if (!ALLOWED_EXTENSIONS.has(ext))
    throw new AttachmentError(
      `Unsupported file extension "${ext}". Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}.`,
    );

  let decoded: Buffer;
  try {
    const normalized = args.data.replace(/\s/g, "");
    z.base64().parse(normalized);
    decoded = Buffer.from(normalized, "base64");
  } catch {
    throw new AttachmentError("The image data is not valid base64.");
  }

  if (decoded.byteLength === 0) throw new AttachmentError("The image data is empty.");
  if (decoded.byteLength > MAX_ATTACHMENT_BYTES)
    throw new AttachmentError(
      `The image exceeds the ${MAX_ATTACHMENT_BYTES / 1024 / 1024} MiB limit.`,
    );

  let filename = sanitizeFilename(args.filename);
  if (!filename.toLowerCase().endsWith(ext)) filename = `${filename}${ext}`;

  const headers = githubHeaders(token);
  let path = `attachments/${filename}`;
  const existing = await existingSha(path, headers);

  if (existing) {
    const timestamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
    const nameWithoutExt = filename.slice(0, -ext.length);
    filename = `${nameWithoutExt}-${timestamp}${ext}`;
    path = `attachments/${filename}`;
  }

  const apiUrl = `https://api.github.com/repos/${REPOSITORY}/contents/${path}`;
  const url = `https://github.com/${REPOSITORY}/blob/${BRANCH}/${path}`;

  let write: Response;
  try {
    write = await fetch(apiUrl, {
      method: "PUT",
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        message: `Add attachment: ${filename}`,
        branch: BRANCH,
        content: decoded.toString("base64"),
      }),
    });
  } catch {
    throw new AttachmentError(
      `GitHub's write status is unknown. Check the repository before retrying: ${url}`,
    );
  }

  await write.body?.cancel();
  if (write.status === 200 || write.status === 201) {
    return {
      filename,
      path,
      url,
      mimeType: MIME_TYPES[ext],
      markdown: `![${args.alt ?? filename}](attachments/${filename})`,
    };
  }

  throw new AttachmentError(
    `GitHub could not save the attachment (HTTP ${write.status}). Check the repository before retrying: ${url}`,
  );
}
