import { colorModePreference } from "../../design-system/color-mode";

export function registerAppearanceControls() {
  if (typeof window === "undefined" || customElements.get("amber-appearance")) return;

  class AmberAppearance extends HTMLElement {
    private controller?: AbortController;
    private observer?: MutationObserver;

    connectedCallback() {
      const select = this.querySelector<HTMLSelectElement>("select");
      const label = this.querySelector<HTMLLabelElement>("label");
      const target = this.dataset.targetId
        ? document.getElementById(this.dataset.targetId)
        : document.documentElement;
      if (!select || !label || !target) return;

      this.controller = new AbortController();
      const { signal } = this.controller;
      const sync = () => {
        select.value = colorModePreference(target.dataset.colorMode);
        if (target === document.documentElement) {
          document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", getComputedStyle(document.body).backgroundColor);
        }
      };

      select.addEventListener(
        "change",
        () => {
          const mode = colorModePreference(select.value);
          target.dataset.colorMode = mode;
          if (this.dataset.persist === "true") {
            try {
              if (mode === "system") localStorage.removeItem("amber-color-mode");
              else localStorage.setItem("amber-color-mode", mode);
            } catch {
              // The current page still switches when storage is unavailable.
            }
          }
          this.dispatchEvent(
            new CustomEvent("amber:color-mode-change", {
              bubbles: true,
              detail: { mode, targetId: this.dataset.targetId },
            }),
          );
        },
        { signal },
      );

      this.observer = new MutationObserver(sync);
      this.observer.observe(target, { attributes: true, attributeFilter: ["data-color-mode"] });
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", sync, { signal });
      sync();
      label.hidden = false;
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.observer?.disconnect();
    }
  }

  customElements.define("amber-appearance", AmberAppearance);
}

registerAppearanceControls();
