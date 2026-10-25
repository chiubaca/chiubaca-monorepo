import source from "../tokens.css?raw";
import { readTokens } from "../token-values";
import { resolveColorMode, type ColorMode } from "../color-mode";

export const tokens = readTokens(source);

export function storyColorMode(globals: Record<string, unknown>): ColorMode {
  return resolveColorMode(globals.colorMode, globals.systemColorMode === "dark");
}

export function modeTokens(mode: ColorMode) {
  return readTokens(source, mode);
}

export function markup(html: string): HTMLElement {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element;
}

export function reviewPage(section: string, title: string, description: string): HTMLElement {
  return markup(`
    <main class="ds-page">
      <header class="ds-header">
        <p class="amber-eyebrow">Amber Journal / ${section}</p>
        <h1 class="amber-type-heading">${title}</h1>
        <p class="ds-introduction">${description}</p>
      </header>
      <div class="ds-content"></div>
      <footer class="ds-footer">chiubaca.com <span>One theme. One CSS source of truth.</span></footer>
    </main>
  `);
}

export function content(page: HTMLElement): HTMLElement {
  return page.querySelector<HTMLElement>(".ds-content")!;
}

export function codeSample(text: string): HTMLElement {
  const pre = document.createElement("pre");
  pre.className = "ds-code";
  const code = document.createElement("code");
  code.textContent = text;
  pre.append(code);
  return pre;
}

export function colourSwatch(
  name: string,
  token: string,
  use: string,
  mode: ColorMode,
): HTMLElement {
  const swatch = markup(`
    <article class="ds-colour">
      <div class="ds-colour-paint" aria-hidden="true"></div>
      <div class="ds-colour-name"><h3>${name}</h3><span>${modeTokens(mode).value(token).toUpperCase()}</span></div>
      <code>${token}</code>
      <p>${use}</p>
    </article>
  `);
  swatch.querySelector<HTMLElement>(".ds-colour-paint")!.style.backgroundColor = `var(${token})`;
  return swatch;
}
