// Hand-drawn doodles for interactive flourishes. Each path draws in with
// stroke-dashoffset; pathLength="1" means no lengths need measuring, and
// paths play in order, so a second stroke follows the first.
export const scribbles = {
  // A quick underline and a shorter second pass beneath it.
  underline: {
    viewBox: "0 0 100 10",
    stretch: true,
    paths: ["M2 4C20 2 45 1 70 2s22 1 27 0", "M14 8c20-1 45-2 68-1"],
  },
  // A signature swash with a little loop at the end.
  swash: {
    viewBox: "0 0 120 20",
    stretch: true,
    paths: ["M2 12c20-4 40-6 60-4 18 2 30 6 26 10-3 3-10-1-8-7 3-7 18-9 38-8"],
  },
  // Three short strokes of excitement.
  sparkle: {
    viewBox: "0 0 16 16",
    stretch: false,
    paths: ["M2 10l5-1", "M5 2l3 5", "M13 3l-3 5"],
  },
  "arrow-east": {
    viewBox: "0 0 24 24",
    stretch: false,
    paths: ["M3 13c5-1 11-2 17-1", "M14 7c3 2 5 4 6 5-2 2-4 4-6 7"],
  },
  "arrow-west": {
    viewBox: "0 0 24 24",
    stretch: false,
    paths: ["M21 13c-5-1-11-2-17-1", "M10 7c-3 2-5 4-6 5 2 2 4 4 6 7"],
  },
  "arrow-north-east": {
    viewBox: "0 0 24 24",
    stretch: false,
    paths: ["M5 19c4-4 9-9 14-13", "M10 5c4 0 7 0 9 1 0 3 0 6 1 9"],
  },
} as const;

export type ScribbleKind = keyof typeof scribbles;

export function scribbleSvg(kind: ScribbleKind): string {
  const { viewBox, stretch, paths } = scribbles[kind];
  const aspect = stretch ? ' preserveAspectRatio="none"' : "";
  const strokes = paths
    .map((d, order) => `<path pathLength="1" style="--amber-scribble-order:${order}" d="${d}"/>`)
    .join("");
  return `<svg class="amber-scribble amber-scribble-${kind}" viewBox="${viewBox}"${aspect} aria-hidden="true" focusable="false">${strokes}</svg>`;
}
