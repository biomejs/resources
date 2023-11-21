/// <reference lib="dom" />
import { DOMParser } from "npm:linkedom@0.16.4";
import { svg2png, initialize } from 'npm:svg2png-wasm@1.4.1';
import resources from './resources.json' with { type: "json" };

type Elem<T> = T extends Array<infer R> ? R : never;

type ThemeKey = keyof typeof resources.themes;

type ColorKey = keyof typeof resources.colors;

type Theme = Record<string, ColorKey>;

function applyTheme(doc: SVGElement, theme: Record<string, keyof typeof resources.colors>): void {
  for (const [selector, color] of Object.entries(theme)) {
    const elem = doc.querySelector(selector);
    if (!elem) continue;
    elem.setAttribute('fill', resources.colors[color] ?? 'none');
  }
}

await initialize(Deno.readFileSync('./lib/svg2png_wasm_bg.wasm'));

/**
 * Parse the file contents and generate a DOM.
 */
const filesWithDOM = resources.files.map(async (file) => {
  const textFile = await Deno.readTextFile(file.path);
  return ({ ...file, dom: (new DOMParser).parseFromString(textFile, "image/svg+xml") })
});

/**
 * Prepare the folders.
 */
await Deno.remove('./svg', { recursive: true });
await Deno.remove('./png', { recursive: true });
await Deno.mkdir('./svg', { recursive: true });
await Deno.mkdir('./png', { recursive: true });

filesWithDOM.forEach(async (filePromise) => {
  const file = await filePromise;
  const fileName = file.path.match(/([\w-]+)\.\w+$/)?.[1];
  if (!fileName) return;

  for (const theme of file.themes) {
    if (!(theme in resources.themes)) return;
    applyTheme(file.dom as unknown as SVGElement, resources.themes[theme as ThemeKey] as Theme);
    const domString = file.dom.toString();
    await Deno.writeTextFile(`./svg/${fileName}-${theme}.svg`, domString);
    await Promise.all(file.scale.flatMap(async (scale) => {
      return [Deno.writeFile(`./png/${fileName}-${theme}-x${scale}.png`, await svg2png(domString, {
        scale,
      }))];
    }));
  }
});

