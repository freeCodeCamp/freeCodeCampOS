import { useQuery } from "@tanstack/react-query";
import { Block } from "./block";
import { getProjects, getState } from "../utils/fetch";
import { Loader } from "./loader";

export const Selection = () => {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const stateQuery = useQuery({
    queryKey: ["state"],
    queryFn: getState,
  });

  if (projectsQuery.isPending || stateQuery.isPending) {
    return <Loader />;
  }

  if (projectsQuery.isError) {
    return <div>Error: {projectsQuery.error.message}</div>;
  }

  if (stateQuery.isError) {
    return <div>Error: {stateQuery.error.message}</div>;
  }

  const projects = projectsQuery.data;
  const state = stateQuery.data;

  return (
    <ul className="blocks">
      {projects.map((project, i) => {
        const projectState = state.projects[project.id] || {
          currentLesson: 0,
          completedDate: null,
        };
        return <Block key={i} {...{ project, projectState }} />;
      })}
    </ul>
  );
};
