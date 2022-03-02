import { useState } from "react";

interface ProjectHintsProps {
  hints: string;
}

const ProjectHints = ({ hints }: ProjectHintsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <details onClick={toggleExpand}>
      <summary>{isExpanded ? "Collapse" : "Expand"} Hints</summary>
      <section id="hints" dangerouslySetInnerHTML={{ __html: hints }}></section>
    </details>
  );
};

export default ProjectHints;
