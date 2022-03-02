import { marked } from "marked";
import * as Prism from "../assets/prism.js";

marked.setOptions({
  highlight: (code, lang: keyof typeof Prism["languages"]) => {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  },
});

export function parseMarkdown(markdown: string) {
  return marked.parse(markdown, { gfm: true });
}
