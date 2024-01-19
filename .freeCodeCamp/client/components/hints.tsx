import { parseMarkdown } from '../utils';

export const Hints = ({ hints }: { hints: string[] }) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {hints.map((hint, i) => (
        <HintElement key={i} {...{ hint, i }} />
      ))}
    </ul>
  );
};

const HintElement = ({ hint, i }: { hint: string; i: number }) => {
  const consoleMarkdown = `<details>\n<summary>Hint ${
    i + 1
  }</summary>\n${hint}\n\n</details>`;
  return (
    <div
      dangerouslySetInnerHTML={{ __html: parseMarkdown(consoleMarkdown) }}
    ></div>
  );
};
