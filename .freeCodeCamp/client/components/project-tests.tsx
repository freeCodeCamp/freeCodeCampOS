interface ProjectTestsProps {
  tests: string;
}

const ProjectTests = ({ tests }: ProjectTestsProps) => {
  return (
    <>
      <h2>Tests</h2>
      <details>
        <summary>Click for Hints</summary>
        <section
          id="tests"
          dangerouslySetInnerHTML={{ __html: tests }}
        ></section>
      </details>
    </>
  );
};

export default ProjectTests;
