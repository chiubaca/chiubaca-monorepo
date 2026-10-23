import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

const SVG_NS = "http://www.w3.org/2000/svg";

// Pen strokes follow currentColor, so the colour lives in CSS and flips with the theme.
const PEN: Options = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  roughness: 1.6,
  bowing: 1.2,
  preserveVertices: false,
};

export function registerRoughTables() {
  if (typeof window === "undefined" || customElements.get("amber-rough-tables")) return;

  // Wraps Markdown content and sketches each table's grid in pen, after
  // h-kono-it/rough-table: one long rough stroke per grid line, measured from
  // the rendered cells. Without JavaScript the plain CSS borders stay.
  class AmberRoughTables extends HTMLElement {
    private observer?: ResizeObserver;

    connectedCallback() {
      this.observer = new ResizeObserver((entries) => {
        for (const entry of entries) draw(entry.target as HTMLTableElement);
      });

      this.querySelectorAll<HTMLTableElement>("table").forEach((table, index) => {
        let frame = table.parentElement;
        if (frame?.localName !== "amber-table") {
          frame = document.createElement("amber-table");
          table.before(frame);
          frame.append(table);
          // The frame scrolls now, so it takes over the keyboard stop.
          if (table.hasAttribute("tabindex")) {
            frame.tabIndex = table.tabIndex;
            table.removeAttribute("tabindex");
          }
        }
        // A fixed seed per table keeps the wobble steady across redraws.
        table.dataset.roughSeed ??= String(index + 1);
        this.observer!.observe(table);
      });
    }

    disconnectedCallback() {
      this.observer?.disconnect();
    }
  }

  customElements.define("amber-rough-tables", AmberRoughTables);
}

function draw(table: HTMLTableElement) {
  const frame = table.parentElement;
  if (!frame) return;
  frame.querySelector(":scope > .amber-table-sketch")?.remove();

  const width = table.offsetWidth;
  const height = table.offsetHeight;
  if (!width || !height) return;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("amber-table-sketch");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.insetInlineStart = `${table.offsetLeft}px`;
  svg.style.insetBlockStart = `${table.offsetTop}px`;

  const rc = rough.svg(svg);
  const seed = Number(table.dataset.roughSeed) || 1;
  const pen = { ...PEN, seed };
  const origin = table.getBoundingClientRect();
  const rows = Array.from(table.rows);

  // The header is shaded in loose hatching, like it was coloured in afterwards.
  const head = table.tHead;
  if (head) {
    const box = head.getBoundingClientRect();
    const shade = rc.rectangle(2, 2, width - 4, box.bottom - origin.top - 4, {
      ...pen,
      stroke: "none",
      fill: "currentColor",
      fillStyle: "hachure",
      fillWeight: 1,
      hachureGap: 7,
      hachureAngle: -50,
    });
    shade.classList.add("amber-table-shade");
    svg.append(shade);
  }

  svg.append(rc.rectangle(0, 0, width, height, pen));

  rows.slice(0, -1).forEach((row, index) => {
    const y = row.getBoundingClientRect().bottom - origin.top;
    svg.append(rc.line(0, y, width, y, { ...pen, seed: seed + index + 1 }));
    // The line under the header is gone over twice.
    if (row.parentElement === head) {
      svg.append(rc.line(0, y + 2, width, y + 1, { ...pen, seed: seed + 50 }));
    }
  });

  const columns = new Set<number>();
  for (const row of rows) {
    for (const cell of Array.from(row.cells).slice(0, -1)) {
      columns.add(Math.round(cell.getBoundingClientRect().right - origin.left));
    }
  }
  [...columns].forEach((x, index) => {
    svg.append(rc.line(x, 0, x, height, { ...pen, seed: seed + 100 + index }));
  });

  frame.prepend(svg);
  frame.dataset.sketched = "";
}

registerRoughTables();
