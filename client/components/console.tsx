import { ConsoleError, TestType } from '../types';
import { parseMarkdown, parseMarkdownInline } from '../utils';

export const Console = ({
  cons,
  tests
}: {
  cons: ConsoleError[];
  tests: TestType[];
}) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {cons.map(con => {
        const originalIndex = tests.findIndex(t => t.test_id === con.test_id);
        return (
          <ConsoleElement key={con.test_id} index={originalIndex} {...con} />
        );
      })}
    </ul>
  );
};

const ConsoleElement = ({
  test_text,
  error,
  index
}: ConsoleError & { index: number }) => {
  return (
    <details>
      <summary>
        {index + 1}{' '}
        <span
          dangerouslySetInnerHTML={{ __html: parseMarkdownInline(test_text) }}
        />
      </summary>
      <div
        dangerouslySetInnerHTML={{
          __html: parseMarkdown(
            '```json\n' +
              (error ? JSON.stringify(error, null, 2) : '') +
              '\n```'
          )
        }}
      />
    </details>
  );
};
