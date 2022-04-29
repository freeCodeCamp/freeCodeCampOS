// import { lazy } from "react";
import { marked } from "marked";
import "../assets/prism.css";
import Prism, { highlight, languages } from "prismjs";
import loadLanguages from "prismjs/components/";
Prism.manual = true;
loadLanguages();
// let Prism = {};
// (async () => {
//   Prism = (await import("../assets/prism.js")).default;
//   console.log(Prism);
// })();
console.log(languages);

marked.setOptions({
  highlight: (code, lang: keyof typeof Prism["languages"]) => {
    if (languages[lang]) {
      return highlight(code, languages[lang], String(lang));
    } else {
      return code;
    }
  },
});

export function parseMarkdown(markdown: string) {
  return marked.parse(markdown, { gfm: true });
}
