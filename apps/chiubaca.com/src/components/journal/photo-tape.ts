// Each layout is where the pieces of tape go; "top" pieces also slide and tilt.
const LAYOUTS = [
  ["strip"],
  ["top"],
  ["top-left", "top-right"],
  ["top-left", "bottom-right"],
  ["top-right", "bottom-left"],
  ["top-left", "top-right", "bottom-left", "bottom-right"],
];
const FOLDS = ["both", "both", "across", "down"];

const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const between = (min: number, max: number) => min + Math.random() * (max - min);

export function registerPhotoTape() {
  if (typeof window === "undefined" || customElements.get("amber-photo-tape")) return;

  // Wraps Markdown content and tapes each photo into the page its own way: a
  // random layout of tape, a random tilt, and a random set of folds. Without
  // JavaScript, the CSS strip of tape and cross fold stay.
  class AmberPhotoTape extends HTMLElement {
    connectedCallback() {
      for (const photo of this.querySelectorAll<HTMLElement>("p:has(> img:only-child)")) {
        if (photo.hasAttribute("data-taped")) continue;

        for (const at of pick(LAYOUTS)) {
          const tape = document.createElement("span");
          tape.className = "amber-tape";
          tape.dataset.at = at;
          tape.setAttribute("aria-hidden", "true");
          if (at === "top") {
            tape.style.setProperty("--amber-tape-x", `${between(15, 85).toFixed(1)}%`);
            tape.style.setProperty("--amber-tape-turn", `${between(-10, 10).toFixed(1)}deg`);
          }
          photo.append(tape);
        }

        const fold = pick(FOLDS);
        if (fold !== "both") photo.dataset.fold = fold;
        photo.style.setProperty("--amber-photo-turn", `${between(-1.2, 1.2).toFixed(2)}deg`);
        photo.dataset.taped = "";
      }
    }
  }

  customElements.define("amber-photo-tape", AmberPhotoTape);
}

registerPhotoTape();
