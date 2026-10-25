import rough from "roughjs";
import type { Drawable, Options, PathInfo } from "roughjs/bin/core";

type DoodleKind = "star" | "scribble" | "squiggle";

interface HeroDoodle {
  kind: DoodleKind;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  ink: boolean;
  paths: PathInfo[];
}

const placements: { kind: DoodleKind; x: number; y: number; size: number }[] = [
  { kind: "star", x: 7, y: 91, size: 68 },
  { kind: "scribble", x: 34, y: 17, size: 104 },
  { kind: "star", x: 65, y: 19, size: 76 },
  { kind: "squiggle", x: 87, y: 25, size: 98 },
  { kind: "scribble", x: 78, y: 44, size: 112 },
  { kind: "star", x: 95, y: 57, size: 56 },
  { kind: "squiggle", x: 83, y: 71, size: 76 },
  { kind: "star", x: 64, y: 84, size: 72 },
  { kind: "scribble", x: 42, y: 89, size: 96 },
  { kind: "squiggle", x: 16, y: 81, size: 72 },
  { kind: "scribble", x: 4, y: 61, size: 80 },
  { kind: "star", x: 91, y: 90, size: 48 },
  { kind: "star", x: 53, y: 10, size: 40 },
];

/** Generate real rough.js paths during SSR; each article keeps its own stable scrawl. */
export function createHeroDoodles(key: string): HeroDoodle[] {
  let hash = 0;
  for (const character of key) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  let state = (hash % 2147483646) + 1;
  const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
  const generator = rough.generator();

  return placements.map((placement, index) => {
    const seed = Math.floor(random() * 2147483646) + 1;
    const pen: Options = {
      seed,
      stroke: "currentColor",
      strokeWidth: 1.3,
      roughness: 1.6,
      bowing: 1.3,
      fixedDecimalPlaceDigits: 2,
      disableMultiStroke: true,
      preserveVertices: true,
    };
    let drawings: Drawable[];

    if (placement.kind === "star") {
      const points: [number, number][] = Array.from({ length: 10 }, (_, point) => {
        const angle = -Math.PI / 2 + (point * Math.PI) / 5;
        const radius = point % 2 === 0 ? 37 : 16;
        return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
      });
      drawings = [generator.polygon(points, pen)];
    } else if (placement.kind === "squiggle") {
      const squiggles = [
        "M10 64C24 96 35 19 48 42S65 92 79 51s2-38 12-35",
        "M12 52C8 21 37 16 38 43s-24 47-9 39 55-90 56-55-60 57-34 47 35-25 40-13",
        "M8 61C35 15 24 94 48 50S61 16 70 50s17 29 22-11",
      ];
      drawings = [generator.path(squiggles[Math.floor(random() * squiggles.length)], pen)];
    } else {
      const scribbles = [
        "M12 65C25 13 43 13 40 61S64 85 62 40 90 23 87 65",
        "M15 70 68 25 28 71 80 32 38 78 88 42 55 80",
        "M12 60C-1 23 70 16 82 43S42 87 24 61s25-43 48-22-8 42-28 26 5-29 18-14",
      ];
      drawings = [generator.path(scribbles[Math.floor(random() * scribbles.length)], pen)];
    }

    return {
      ...placement,
      x: placement.x + (random() - 0.5) * 3,
      y: placement.y + (random() - 0.5) * 3,
      rotation: (random() - 0.5) * 38,
      opacity: 0.3 + random() * 0.14,
      ink: index % 3 === 1,
      // Join rough.js's adjoining segment starts into one uninterrupted pen pass.
      paths: drawings.flatMap((drawing) =>
        generator.toPaths(drawing).map((path) => ({
          ...path,
          d: path.d
            .trim()
            .replace(/M/g, (command, offset: number) => (offset === 0 ? command : "L")),
        })),
      ),
    };
  });
}
