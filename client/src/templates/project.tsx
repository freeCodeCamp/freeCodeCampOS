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
    queryKey: ["postState", { projectId, lessonId }],
    enabled: !!getStateQuery.data,
    queryFn: async () => {
      const state = getStateQuery.data!;
      const projects = {
        ...state.projects,
        [projectId]: {
          ...state.projects[projectId],
          currentLesson: lessonId,
        },
      };
      return postState({ currentProject: projectId, projects });
    },
  });

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => getProject(projectId),
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
  const lesson = project.lessons[lessonId];
  return (
    <>
      <div className="container">
        <Heading
          {...{
            projectId,
            currentLesson: lessonId,
            title: project.title,
            numberOfLessons: project.numberOfLessons,
          }}
        />

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
  params: {
    parse: ({ projectId, lessonId }) => {
      return {
        projectId: Number(projectId),
        lessonId: Number(lessonId),
      };
    },
  },
});
