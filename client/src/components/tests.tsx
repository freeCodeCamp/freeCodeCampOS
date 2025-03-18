import { TestState } from "../../../types";
import { Test } from "./test";

interface TestsProps {
  testsState: TestState[];
}

export const Tests = ({ testsState }: TestsProps) => {
  return (
    <ul style={{ listStyle: "none" }}>
      {testsState.map((testState, i) => (
        <Test key={i} {...testState} />
      ))}
    </ul>
  );
};
