const RESET_AFTER = 2000;

// Roughly drawn: two wobbly sheets with overshooting corners, and a loose tick.
const ICONS = `<svg class="amber-code-copy-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.6 9.6c2.2-.9 5.6-.7 11.6-.8.9 2.8.4 7.9.7 11.2-3.9 1-7.6.4-11.9.6-.8-3.6.1-7.3-.6-10.4 1.4-.6 3-.3 4.3-.5"/><path d="M15.6 6.1c.3-.9-.3-1.8-.4-2.6-3.9.4-6.9-.4-11 .4.6 3.5-.4 7.2.4 10.9.6.4 1.6.3 2.3.1"/></svg><svg class="amber-code-copy-done" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.8 12.2c1.9.9 3.7 3.4 4.9 5.6 2.2-4.6 6.9-10.3 11.7-12.8-.9.8-1.6 1.5-2.3 2.1"/></svg>`;

export function registerCodeCopy() {
  if (typeof window === "undefined" || customElements.get("amber-code-copy")) return;

  // Wraps Markdown content and gives each code block a small copy icon. Without
  // JavaScript or the async clipboard API, no button is added at all.
  class AmberCodeCopy extends HTMLElement {
    private controller?: AbortController;

    connectedCallback() {
      if (!navigator.clipboard?.writeText) return;
      this.controller = new AbortController();
      const { signal } = this.controller;

      let status = this.querySelector<HTMLElement>(":scope > .amber-code-copy-status");
      if (!status) {
        status = document.createElement("span");
        status.className = "amber-code-copy-status amber-visually-hidden";
        status.setAttribute("role", "status");
        this.append(status);
      }

      for (const pre of this.querySelectorAll<HTMLPreElement>("pre")) {
        if (pre.parentElement?.localName === "amber-code") continue;
        const frame = document.createElement("amber-code");
        pre.before(frame);
        frame.append(pre);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "amber-code-copy";
        button.innerHTML = ICONS;
        button.title = "Copy code";
        button.setAttribute("aria-label", "Copy code to clipboard");
        frame.prepend(button);

        let reset: number | undefined;
        button.addEventListener(
          "click",
          async () => {
            const text = (pre.querySelector("code") ?? pre).textContent ?? "";
            try {
              await navigator.clipboard.writeText(text.replace(/\n$/, ""));
              button.dataset.state = "copied";
              status!.textContent = "Code copied to clipboard";
            } catch {
              button.dataset.state = "failed";
              status!.textContent = "Couldn’t copy the code";
            }
            window.clearTimeout(reset);
            reset = window.setTimeout(() => {
              delete button.dataset.state;
              status!.textContent = "";
            }, RESET_AFTER);
          },
          { signal },
        );
      }
    }

    disconnectedCallback() {
      this.controller?.abort();
    }
  }

  customElements.define("amber-code-copy", AmberCodeCopy);
}

registerCodeCopy();
