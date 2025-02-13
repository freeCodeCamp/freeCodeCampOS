import { useState } from "react";
import { Tests } from "./tests";
import { Console } from "./console";
import { Hints } from "./hints";

interface OutputProps {
  hints: string[];
}

export const Output = ({ hints }: OutputProps) => {
  const [selectedBtn, setSelectedBtn] = useState("tests");

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
              return <Tests />;
            case "console":
              return <Console />;
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
