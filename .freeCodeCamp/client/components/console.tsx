import { useState } from "react";

const Console = ({ cons }: { cons: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <details onClick={toggleExpand}>
      <summary>{isExpanded ? "Collapse" : "Expand"} Console</summary>
      <section
        id="console"
        dangerouslySetInnerHTML={{ __html: cons }}
      ></section>
    </details>
  );
};

export default Console;
