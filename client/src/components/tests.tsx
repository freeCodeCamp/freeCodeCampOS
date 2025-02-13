import { TestState } from "../../../types";
import { Test } from "./test";

interface TestsProps {
  testsState: TestState[];
}

export const Tests = ({ testsState }: TestsProps) => {
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
