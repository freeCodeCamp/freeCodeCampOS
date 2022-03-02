import Description from "../components/description";
import Loader from "../components/loader";
import Header from "../components/header";
import Heading from "../components/heading";
import IntegratedProjectTests from "../components/integrated-project-tests";
import Console from "../components/console";
import { F, TestType } from "../types";
import "./integrated-project.css";
import Ruler from "../components/ruler";

interface IntegratedProjectProps {
  runTests: F<void, void>;
  description: string;
  topic: string;
  project: string;
  tests: TestType[];
  cons: string;
  isLoading: boolean;
}

const IntegratedProject = ({
  runTests,
  description,
  topic,
  project,
  tests,
  cons,
  isLoading,
}: IntegratedProjectProps) => {
  return (
    <>
      <Header />
      <Heading topic={topic} project={project} />
      <Description description={description} />
      <Ruler />
      <IntegratedProjectTests tests={tests} />
      <Ruler />
      {isLoading ? <Loader /> : <Console cons={cons} />}
      <footer>
        <button onClick={() => runTests()}>Run Tests</button>
      </footer>
    </>
  );
};

export default IntegratedProject;
