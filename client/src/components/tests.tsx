import { useContext, useEffect, useState } from "react";
import { TestState, WSSEvents } from "../../../types";
import { Test } from "./test";
import { WebSocketContext } from "../context/websocket";

export const Tests = () => {
  const [testsState, setTestsState] = useState<TestState[]>([]);
  const { socket } = useContext(WebSocketContext)!;

  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", handleTestsState);
    }

    return () => {
      if (socket) {
        socket.removeEventListener("message", handleTestsState);
      }
    };
  }, []);

  function handleTestsState(event: MessageEvent) {
    const data = JSON.parse(event.data);
    switch (data.event) {
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
    <ul style={{ listStyle: "none" }}>
      {testsState.map(({ testText, passed, isLoading, testId }, i) => (
        <Test
          key={i}
          {...{
            testText,
            passed,
            isLoading,
            testId,
          }}
        />
      ))}
    </ul>
  );
};
