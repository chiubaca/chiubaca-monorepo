// Throwaway homepage studies. Keep until a design direction has been chosen.
export type HomepageVariant = "amber" | "midnight" | "daybreak";

export interface PrototypePost {
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  category: string;
  readingTime: number;
}

export interface PrototypeNote {
  href: string;
  date: string;
  tags: string[];
}

export interface VariantProps {
  posts: PrototypePost[];
  featured: PrototypePost;
  personal: PrototypePost;
  note: PrototypeNote;
}
