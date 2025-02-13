import { createRootRoute, Outlet } from "@tanstack/react-router";
import { markedHighlight } from "marked-highlight";
import { Suspense } from "react";
import { marked } from "marked";
import Prism from "prismjs";

import { Header } from "../components/header";
import { Loader } from "../components/loader";

marked.use(
  markedHighlight({
    highlight: (code, lang: keyof (typeof Prism)["languages"]) => {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], String(lang));
      } else {
        return code;
      }
    },
  })
);

function parseMarkdown(markdown: string) {
  return marked.parse(markdown, { gfm: true });
}

export function parse(objOrString: any) {
  if (typeof objOrString === "string") {
    return JSON.parse(objOrString);
  } else {
    return JSON.stringify(objOrString);
  }
}

export const rootRoute = createRootRoute({
  component: () => {
    return (
      <>
        <Suspense fallback={<Loader />}>
          <Header />
          <Outlet />
        </Suspense>
      </>
    );
  },
});
