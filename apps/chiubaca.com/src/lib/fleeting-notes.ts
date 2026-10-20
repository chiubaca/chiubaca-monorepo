import { fromMarkdown } from "mdast-util-from-markdown";
import type { FleetingNoteSummary, NotesPagination } from "../components/journal/types";

export const NOTES_PER_PAGE = 24;

interface NoteEntry {
  id: string;
  body?: string;
  data: { publish_date: Date; tags?: string[] | null };
}

interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
}

export function sortFleetingNotes<T extends NoteEntry>(notes: readonly T[]): T[] {
  return [...notes].sort(
    (a, b) =>
      b.data.publish_date.valueOf() - a.data.publish_date.valueOf() || b.id.localeCompare(a.id),
  );
}

function nodeText(node: MarkdownNode): string {
  if (["code", "html", "image", "definition", "thematicBreak"].includes(node.type)) return "";
  if (typeof node.value === "string") return node.value;
  if (node.children) {
    const separator = [
      "root",
      "list",
      "listItem",
      "blockquote",
      "table",
      "tableRow",
      "tableCell",
    ].includes(node.type)
      ? " "
      : "";
    return node.children.map(nodeText).join(separator);
  }
  return "";
}

function cleanText(text: string): string {
  return text
    .replace(
      /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
      (_, target: string, label?: string) => label ?? target.split("/").at(-1) ?? target,
    )
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string): string {
  const characters = Array.from(text);
  if (characters.length <= 220) return text;
  const clipped = characters.slice(0, 219).join("");
  return `${clipped.replace(/\s+\S*$/, "").trimEnd()}…`;
}

export function summariseFleetingNote(note: NoteEntry): FleetingNoteSummary {
  const blocks = fromMarkdown(note.body ?? "").children;
  const heading = blocks.find((node) => node.type === "heading" && node.depth === 1);
  const title = heading
    ? cleanText(nodeText(heading))
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(note.data.publish_date);
  const text = cleanText(
    blocks
      .filter((node) => node.type !== "heading")
      .map(nodeText)
      .join(" "),
  );

  return {
    id: note.id,
    href: `/fleeting-notes/${encodeURIComponent(note.id)}/`,
    title,
    excerpt: excerpt(text),
    hasTitle: Boolean(heading),
    published: note.data.publish_date.toISOString(),
    tags: [...new Set(note.data.tags ?? [])].filter(
      (tag) => tag !== "fleeting" && tag !== "uncategorised",
    ),
  };
}

export function notesPageHref(page: number): string {
  return page === 1 ? "/fleeting-notes/" : `/fleeting-notes/page/${page}/`;
}

export function paginateFleetingNotes<T>(
  notes: readonly T[],
  page = 1,
): { notes: T[]; pagination: NotesPagination } {
  const pageCount = Math.max(1, Math.ceil(notes.length / NOTES_PER_PAGE));
  if (!Number.isInteger(page) || page < 1 || page > pageCount)
    throw new RangeError("Unknown notes page");
  const offset = (page - 1) * NOTES_PER_PAGE;
  return {
    notes: notes.slice(offset, offset + NOTES_PER_PAGE),
    pagination: {
      page,
      pageCount,
      total: notes.length,
      start: notes.length ? offset + 1 : 0,
      end: Math.min(offset + NOTES_PER_PAGE, notes.length),
      newerHref: page > 1 ? notesPageHref(page - 1) : null,
      olderHref: page < pageCount ? notesPageHref(page + 1) : null,
    },
  };
}

export function noteSourceHref(id: string): string {
  return `https://github.com/chiubaca/notes/edit/main/fleeting-notes/${id.split("/").map(encodeURIComponent).join("/")}.md`;
}
