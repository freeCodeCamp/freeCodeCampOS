import { useState } from "react";
import { TestType } from "../types";
import Test from "./test";

interface ProjectTestsProps {
  tests: TestType[];
}

const ProjectTests = ({ tests }: ProjectTestsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <details onClick={toggleExpand}>
      <summary>{isExpanded ? "Collapse" : "Expand"} Tests</summary>
      <ul>
        {tests.map(({ testText, passed, isLoading, testId }, i) => (
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
    </details>
  );
};

export default ProjectTests;
