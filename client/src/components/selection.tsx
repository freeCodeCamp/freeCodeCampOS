import { useQuery } from "@tanstack/react-query";
import { State } from "../../../types";
import { Block } from "./block";
import { getProjects } from "../utils/fetch";

export interface SelectionProps {
  state: State;
}
export const Selection = ({ state }: SelectionProps) => {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => getProjects(),
  });

  return (
    <ul className="blocks">
      {projects.map((project, i) => {
        const projectState = state.projects[project.dashedName] || {
          currentLesson: 0,
          completedDate: null,
        };
        console.log(projectState);
        return <Block key={i} {...{ project, projectState }} />;
      })}
    </ul>
  );
};
