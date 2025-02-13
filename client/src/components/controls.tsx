import { useContext, useEffect, useState } from "react";
import { Project, TestState, WSSEvents } from "../../../types";
import { WebSocketContext } from "../context/websocket";
import { cancelTests, runTests } from "../utils/fetch";

interface ControlsProps {
  // cancelTests: F<void, void>;
  // runTests: F<void, void>;
  // resetProject?: F<void, void>;
  // isResetEnabled?: ProjectI['isResetEnabled'];
  project: Project;
  // testsState: TestState[];
  // loader?: LoaderT;
}

// Changes the Reset button background to a filling progress bar when the seed is running
function progressStyle(loader: any) {
  if (!loader) {
    return {};
  }

  const {
    isLoading,
    progress: { total, count },
  } = loader;
  if (isLoading) {
    return {
      background: `linear-gradient(to right, #0065A9 ${
        (count / total) * 100
      }%, rgba(0,0,0,0) 0%)`,
    };
  }
}

export const Controls = ({
  // cancelTests,
  // runTests,
  // resetProject,
  // isResetEnabled,
  project,
}: // testsState,
// loader
ControlsProps) => {
  const [isTestsRunning, setIsTestsRunning] = useState(false);
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
      default:
        break;
    }
  }

  useEffect(() => {
    if (testsState.some((t) => t.isLoading)) {
      setIsTestsRunning(true);
    } else {
      setIsTestsRunning(false);
    }
  }, [testsState]);

  function handleTests() {
    if (isTestsRunning) {
      cancelTests();
    } else {
      runTests();
    }
  }

  const resetDisabled = !project.isResetEnabled;
  // const resetDisabled = !project.isResetEnabled || loader?.isLoading;

  return (
    <section className="project-controls">
      <button className="secondary-cta" onClick={handleTests}>
        {isTestsRunning ? "Cancel Tests" : "Run Tests"}
      </button>
      <button
        disabled={resetDisabled}
        style={{
          // ...progressStyle(loader),
          cursor: resetDisabled ? "not-allowed" : "pointer",
        }}
        onClick={() => {}}
      >
        Reset Step
      </button>
    </section>
  );
};
