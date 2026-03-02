import { ConsoleError } from '../types';

export const Console = ({ cons }: { cons: ConsoleError[] }) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {cons.map((con, i) => (
        <ConsoleElement key={con.test_id} index={i} {...con} />
      ))}
    </ul>
  );
};

const ConsoleElement = ({
  test_text,
  test_id,
  error,
  index
}: ConsoleError & { index: number }) => {
  const details = `<summary>${index + 1} ${test_text}</summary>

  ${error}`;
  return (
    <details
      dangerouslySetInnerHTML={{
        __html: details
      }}
    ></details>
  );
};
