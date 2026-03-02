import { ConsoleError } from '../types';

export const Console = ({ cons }: { cons: ConsoleError[] }) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {cons.map(con => (
        <ConsoleElement key={con.test_id} {...con} />
      ))}
    </ul>
  );
};

const ConsoleElement = ({ test_text, test_id, error }: ConsoleError) => {
  const details = `<summary>${test_id + 1} ${test_text}</summary>

  ${error}`;
  return (
    <details
      dangerouslySetInnerHTML={{
        __html: details
      }}
    ></details>
  );
};
