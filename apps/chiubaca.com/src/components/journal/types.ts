export interface PostSummaryProps {
  title: string;
  href: string;
  /** ISO 8601 publication date; stays portable across story render transports. */
  published: string;
  summary?: string;
  category?: string;
  headingLevel?: "h2" | "h3";
}

export interface WritingSectionProps {
  id: string;
  title: string;
  archiveHref?: string;
  archiveLabel?: string;
}

export interface AppearanceSelectProps {
  /** Omit to control the document. Supply an ID for an isolated preview. */
  targetId?: string;
  persist?: boolean;
}

export interface JournalShellProps {
  active?: "writing" | "notes" | "memories";
  homeHref?: string;
  writingHref?: string;
}

export interface FleetingNoteSummary {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  /** The Markdown already provides an H1; don't add a second page title. */
  hasTitle: boolean;
  published: string;
  tags: string[];
}

export interface NotesPagination {
  page: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
  newerHref: string | null;
  olderHref: string | null;
}
