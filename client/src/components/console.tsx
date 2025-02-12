import { ConsoleError } from '../types';

export const Console = ({ cons }: { cons: ConsoleError[] }) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {cons.map(con => (
        <ConsoleElement key={con.testId} {...con} />
      ))}
    </ul>
  );
};

const ConsoleElement = ({ testText, testId, error }: ConsoleError) => {
  const details = `<summary>${testId + 1} ${testText}</summary>

  ${error}`;
  return (
    <details
      dangerouslySetInnerHTML={{
        __html: details
      }}
    ></details>
  );
};
