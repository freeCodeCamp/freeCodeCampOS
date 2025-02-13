import { useContext, useEffect, useState } from "react";
import { Tests } from "./tests";
import { Console } from "./console";
import { Hints } from "./hints";
import { ConsoleError, TestState, WSSEvents } from "../../../types";
import { WebSocketContext } from "../context/websocket";

interface OutputProps {
  hints: string[];
}

export const Output = ({ hints }: OutputProps) => {
  const [consoleErrors, setConsoleErrors] = useState<ConsoleError[]>([]);
  const [testsState, setTestsState] = useState<TestState[]>([]);
  const [selectedBtn, setSelectedBtn] = useState("tests");

  const { socket } = useContext(WebSocketContext)!;

  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", handleSocket);
    }

    return () => {
      if (socket) {
        socket.removeEventListener("message", handleSocket);
      }
    };
  }, []);

  function handleSocket(event: MessageEvent) {
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
      case WSSEvents.UPDATE_TESTS_STATE:
        const testsState = data.data.testsState as TestState[];
        setTestsState(testsState);
        break;
      case WSSEvents.UPDATE_TEST_STATE:
        const testState = data.data.testState as TestState;
        setTestsState((prev) =>
          prev.map((t) => (t.testId === testState.testId ? testState : t))
        );
        break;
      default:
        break;
    }
  }

  return (
    <section className="project-output">
      <ul>
        <li>
          <button
            className="output-btn"
            disabled={selectedBtn === "tests"}
            onClick={() => {
              setSelectedBtn("tests");
            }}
          >
            Tests
          </button>
        </li>
        <li>
          <button
            className="output-btn"
            disabled={selectedBtn === "console"}
            onClick={() => {
              setSelectedBtn("console");
            }}
          >
            Console
          </button>
        </li>
        {hints.length ? (
          <li>
            <button
              className="output-btn"
              disabled={selectedBtn === "hints"}
              onClick={() => {
                setSelectedBtn("hints");
              }}
            >
              Hints
            </button>
          </li>
        ) : null}
      </ul>

      <div className="project-output-content">
        {(() => {
          switch (selectedBtn) {
            case "tests":
              return <Tests testsState={testsState} />;
            case "console":
              return <Console consoleErrors={consoleErrors} />;
            case "hints":
              return <Hints hints={hints} />;
            default:
              return <div>No content</div>;
          }
        })()}
      </div>
    </section>
  );
};
