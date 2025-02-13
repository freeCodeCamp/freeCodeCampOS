import { useContext, useEffect, useState } from "react";
import { ConsoleError, WSSEvents } from "../../../types";
import { WebSocketContext } from "../context/websocket";

export const Console = () => {
  const [consoleErrors, setConsoleErrors] = useState<ConsoleError[]>([]);
  const { socket } = useContext(WebSocketContext)!;

  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", handleCons);
    }

    return () => {
      if (socket) {
        socket.removeEventListener("message", handleCons);
      }
    };
  }, []);

  function handleCons(event: MessageEvent) {
    const data = JSON.parse(event.data);
    switch (data.event) {
      case WSSEvents.UPDATE_CONSOLE:
        const consoleError = data.data.consoleError as ConsoleError;
        if (!Object.keys(consoleError).length) {
          return setConsoleErrors([]);
        }
        // Insert consoleError in array at index `id`
        setConsoleErrors((prev) => {
          const sorted = [
            ...prev.slice(0, consoleError.testId),
            consoleError,
            ...prev.slice(consoleError.testId),
          ].filter(Boolean);
          return sorted;
        });
        break;
      default:
        break;
    }
  }
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
