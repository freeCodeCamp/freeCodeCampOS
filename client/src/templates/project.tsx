import { Description } from "../components/description";
import { Heading } from "../components/heading";
import { Controls } from "../components/controls";
import { Output } from "../components/output";
import "./project.css";
import { State } from "../../../types";
import { useQuery } from "@tanstack/react-query";
import { getProject } from "../utils/fetch";

export interface ProjectProps {
  state: State;
}

export const Project = ({ state }: ProjectProps) => {
  const projectQuery = useQuery({
    queryKey: ["project"],
    queryFn: async () => getProject(state.currentProject),
  });
  return (
    <>
      <div className="container">
        <Heading
          {...(project.isIntegrated
            ? { title: project.title }
            : {
                goToNextLesson,
                goToPreviousLesson,
                numberOfLessons: project.numberOfLessons,
                title: project.title,
                lessonNumber,
              })}
        />

        <Description description={description} />

        <Controls
          {...(project.isIntegrated
            ? {
                cancelTests,
                runTests,
                tests,
              }
            : {
                cancelTests,
                runTests,
                resetProject,
                isResetEnabled: project.isResetEnabled,
                tests,
                loader,
              })}
        />

        <Output {...{ hints, tests, cons }} />
      </div>
    </>
  );
};
