import { ConsoleError, TestType } from '../types';
import { parseMarkdown } from '../utils';

export const Console = ({ cons, tests }: { cons: ConsoleError[]; tests: TestType[] }) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {cons.map((con) => {
        const originalIndex = tests.findIndex(t => t.test_id === con.test_id);
        return <ConsoleElement key={con.test_id} index={originalIndex} {...con} />;
      })}
    </ul>
  );
};

const ConsoleElement = ({
  test_text,
  error,
  index
}: ConsoleError & { index: number }) => {
  const details = `<summary>${index + 1} ${test_text}</summary>

  \`\`\`json
  ${error ? JSON.stringify(error, null, 2) : ''}
  \`\`\``;
  return (
    <details
      dangerouslySetInnerHTML={{
        __html: parseMarkdown(details)
      }}
    ></details>
  );
};
