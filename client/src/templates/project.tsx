import { Description } from "../components/description";
import { Heading } from "../components/heading";
import { Controls } from "../components/controls";
import { Output } from "../components/output";
import "./project.css";
import { useQuery } from "@tanstack/react-query";
import { getProject, getState, postState } from "../utils/fetch";
import { Loader } from "../components/loader";
import { rootRoute } from "../utils";
import { createRoute } from "@tanstack/react-router";

export const Project = () => {
  const { projectId, lessonId } = LessonRoute.useParams();
  const getStateQuery = useQuery({
    queryKey: ["state"],
    queryFn: getState,
  });

  const postStateQuery = useQuery({
    queryKey: ["postState"],
    enabled: getStateQuery.isSuccess,
    queryFn: async () => {
      const state = getStateQuery.data!;
      const projects = {
        ...state.projects,
        [projectId]: {
          ...state.projects[Number(projectId)],
          currentLesson: Number(lessonId),
        },
      };
      return postState({ currentProject: Number(projectId), projects });
    },
  });

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    enabled: postStateQuery.isSuccess && getStateQuery.isSuccess,
    queryFn: async () => getProject(Number(projectId)),
  });

  if (getStateQuery.isPending) {
    return <Loader />;
  }

  if (getStateQuery.isError) {
    return <div>Error: {getStateQuery.error.message}</div>;
  }

  if (postStateQuery.isPending) {
    return <Loader />;
  }

  if (postStateQuery.isError) {
    return <div>Error: {postStateQuery.error.message}</div>;
  }

  if (projectQuery.isPending) {
    return <Loader />;
  }

  if (projectQuery.isError) {
    return <div>Error: {projectQuery.error.message}</div>;
  }

  const project = projectQuery.data;
  const lesson = project.lessons[Number(lessonId)];
  return (
    <>
      <div className="container">
        <Heading />

        <Description description={lesson.description} />

        <Controls project={project} />

        <Output {...{ hints: lesson.hints }} />
      </div>
    </>
  );
};

export const LessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project/$projectId/$lessonId",
  component: Project,
});
