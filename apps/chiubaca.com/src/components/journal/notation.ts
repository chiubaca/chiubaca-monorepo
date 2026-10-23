import { annotate } from "rough-notation";
import type { RoughAnnotation, RoughAnnotationConfig } from "rough-notation/lib/model";

interface Mark {
  // The link the reader reaches for, and what gets marked when they do.
  link: string;
  target?: (link: HTMLElement) => HTMLElement | null;
  // Colours the mark through CSS, so it follows the theme (see motion.css).
  className: "amber-notation-pen" | "amber-notation-marker";
  config: RoughAnnotationConfig;
  // Underline the words, not the bottom of a tall tap target.
  hugText?: boolean;
}

const PEN = {
  type: "underline",
  strokeWidth: 1.75,
  padding: 1,
  iterations: 1,
  animationDuration: 260,
} as const;
const MARKER = {
  type: "highlight",
  multiline: true,
  iterations: 1,
  animationDuration: 360,
} as const;

// First match wins, so the narrower selectors come first.
const MARKS: Mark[] = [
  {
    link: "a:has(.amber-route)",
    target: (link) => link.querySelector(".amber-route"),
    className: "amber-notation-marker",
    config: { ...MARKER, padding: [1, 4] },
  },
  {
    link: ".amber-prose [data-footnote-ref]",
    className: "amber-notation-pen",
    config: { ...PEN, padding: [0, 1] },
  },
  {
    link: ".amber-prose a:not(.anchor, [data-footnote-ref], [data-footnote-backref])",
    className: "amber-notation-marker",
    config: { ...MARKER, padding: [0, 3] },
  },
  {
    link: ":is(.amber-header nav, .amber-footer) a:not([aria-current])",
    className: "amber-notation-pen",
    config: PEN,
    hugText: true,
  },
];

// You are here: the current page stays underlined twice, without drawing in.
const CURRENT = ".amber-header nav a[aria-current]:not([data-noted])";

const notes = new WeakMap<HTMLElement, RoughAnnotation>();
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// How far the bottom of the element sits below its words, so an underline can tuck up under them.
function textGap(element: HTMLElement) {
  const text = [...element.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
  if (!text) return 0;
  const range = document.createRange();
  range.selectNodeContents(text);
  return element.getBoundingClientRect().bottom - range.getBoundingClientRect().bottom;
}

function note(
  element: HTMLElement,
  className: Mark["className"],
  config: RoughAnnotationConfig,
  hugText = false,
) {
  let annotation = notes.get(element);
  if (!annotation) {
    if (hugText) config = { ...config, padding: [0, 1, 2 - textGap(element), 1] };
    annotation = annotate(element, config);
    notes.set(element, annotation);
    // rough-notation puts highlights before the element and everything else after it.
    const svg =
      config.type === "highlight" ? element.previousElementSibling : element.nextElementSibling;
    svg?.classList.add(className);
  }
  annotation.animate = !still();
  return annotation;
}

function find(from: EventTarget | null) {
  if (!(from instanceof Element)) return;
  for (const mark of MARKS) {
    const link = from.closest<HTMLElement>(mark.link);
    if (!link) continue;
    const target = mark.target ? mark.target(link) : link;
    return target ? { link, target, mark } : undefined;
  }
}

function show(event: Event) {
  const found = find(event.target);
  if (!found || (event.type === "focusin" && !found.link.matches(":focus-visible"))) return;
  const annotation = note(
    found.target,
    found.mark.className,
    found.mark.config,
    found.mark.hugText,
  );
  if (!annotation.isShowing()) annotation.show();
}

function hide(event: PointerEvent | FocusEvent) {
  const found = find(event.target);
  if (!found || found.link.contains(event.relatedTarget as Node | null)) return;
  // Keep the mark while the link is still hovered or focused the other way.
  if (
    event.type === "pointerout"
      ? found.link.matches(":focus-visible")
      : found.link.matches(":hover")
  )
    return;
  notes.get(found.target)?.hide();
}

function markCurrent() {
  for (const link of document.querySelectorAll<HTMLElement>(CURRENT)) {
    link.dataset.noted = "";
    const annotation = note(link, "amber-notation-pen", { ...PEN, iterations: 2 }, true);
    annotation.animate = false;
    annotation.show();
  }
}

export function registerNotation() {
  if (typeof window === "undefined" || document.documentElement.hasAttribute("data-notation"))
    return;

  // Hands the underlines and marker over from CSS, which keeps them without JavaScript.
  document.documentElement.dataset.notation = "";
  document.addEventListener("pointerover", show);
  document.addEventListener("focusin", show);
  document.addEventListener("pointerout", hide);
  document.addEventListener("focusout", hide);

  // Pages (and Storybook stories) can arrive after this runs.
  const watchCurrent = () => {
    markCurrent();
    new MutationObserver(markCurrent).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) watchCurrent();
  else document.addEventListener("DOMContentLoaded", watchCurrent, { once: true });
}

registerNotation();
