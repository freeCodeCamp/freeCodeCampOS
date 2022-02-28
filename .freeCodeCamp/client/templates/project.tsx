import Description from "../components/description";
import Header from "../components/header";
import Loader from "../components/loader";
import ProjectHeading from "../components/project-heading";
import ProjectTests from "../components/project-tests";
import "./project.css";
import { F } from "../types";

interface ProjectProps {
  runTests: F<void, void>;
  resetProject: F<void, void>;
  goToNextLesson: F<void, void>;
  goToPreviousLesson: F<void, void>;
  isLoading: boolean;
  project: string;
  topic: string;
  lessonNumber: number;
  description: string;
  tests: string;
}

const Project = ({
  runTests,
  resetProject,
  goToNextLesson,
  goToPreviousLesson,
  isLoading,
  project,
  topic,
  lessonNumber,
  description,
  tests,
}: ProjectProps) => {
  return (
    <>
      <Header />
      <ProjectHeading
        topic={topic}
        project={project}
        lessonNumber={lessonNumber}
      />

      <Description description={description} />
      <ProjectTests tests={tests} />

      {isLoading && <Loader />}
      <footer>
        <button onClick={() => runTests()}>Run Tests</button>
        <button onClick={() => resetProject()}>Reset Project</button>
        <button onClick={() => goToNextLesson()}>Go To Next Lesson</button>
        <button onClick={() => goToPreviousLesson()}>
          Go To Previous Lesson
        </button>
      </footer>
    </>
  );
};

export default Project;
