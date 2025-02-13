import { ConsoleError } from "../../../types";

interface ConsoleProps {
  consoleErrors: ConsoleError[];
}

export const Console = ({ consoleErrors }: ConsoleProps) => {
  return (
    <ul style={{ listStyle: "none" }}>
      {consoleErrors.map((consoleError) => (
        <ConsoleElement key={consoleError.testId} {...consoleError} />
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
        __html: details,
      }}
    ></details>
  );
};
