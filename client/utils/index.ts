import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import Prism from 'prismjs';

marked.use(
  markedHighlight({
    highlight: (code: string, lang: string) => {
      if (lang && Prism.languages[lang as keyof typeof Prism.languages]) {
        try {
          return Prism.highlight(
            code,
            Prism.languages[lang as keyof typeof Prism.languages],
            lang
          );
        } catch {
          return code;
        }
      } else {
        return code;
      }
    }
  })
);

export function parseMarkdown(markdown: string): string {
  return marked.parse(markdown, { gfm: true }) as string;
}

export function parseMarkdownInline(markdown: string): string {
  return marked.parseInline(markdown, { gfm: true }) as string;
}

export function parse(objOrString: unknown): any {
  if (typeof objOrString === 'string') {
    return JSON.parse(objOrString);
  } else {
    return JSON.stringify(objOrString);
  }
}
