import { useNavigate } from "@tanstack/react-router";
import { LessonRoute } from "../templates/project";
import { useQuery } from "@tanstack/react-query";
import { getProject, getState } from "../utils/fetch";
import { Loader } from "./loader";
import { useEffect, useState } from "react";
import { Project, State } from "../../../types";

export const Heading = () => {
  const navigate = useNavigate();
  // const [anim, setAnim] = useState("");
  const [state, setState] = useState<State | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const stateQuery = useQuery({
    queryKey: ["state", window.location.pathname],
    queryFn: () => {
      console.debug("fetching state");
      return getState();
    },
  });

  const projectQuery = useQuery({
    queryKey: [
      "project",
      window.location.pathname,
      stateQuery?.data?.currentProject,
    ],
    enabled: stateQuery.isSuccess,
    queryFn: async () => {
      console.debug("fetching project", stateQuery.data);
      const { currentProject } = stateQuery.data!;

      return getProject(currentProject!);
    },
  });

  // TODO:
  // useEffect(() => {
  //   setAnim("fade-in");
  //   setTimeout(() => setAnim(""), 1000);
  // }, [currentLesson]);

  useEffect(() => {
    const s = stateQuery.data;
    const p = projectQuery.data;
    if (!s || !p) {
      return;
    }
    setState(s);
    setProject(p);
    const cl = s.projects[p.id].currentLesson;
    setCurrentLesson(cl);
    const cgb = cl > 0;
    const cgf = cl < p.numberOfLessons - 1;

    setCanGoBack(cgb);
    setCanGoForward(cgf);
  }, [stateQuery.data, projectQuery.data]);

  if (stateQuery.isPending || projectQuery.isPending) {
    return <Loader />;
  }

  if (stateQuery.isError || projectQuery.isError) {
    return (
      <div>
        Error: {stateQuery.error?.message || projectQuery.error?.message}
      </div>
    );
  }

  function goToPreviousLesson() {
    if (!project || !state) {
      return;
    }
    navigate({
      to: LessonRoute.to,
      params: {
        projectId: project.id,
        lessonId: currentLesson - 1,
      },
    });
  }

  function goToNextLesson() {
    if (!project || !state) {
      return;
    }
    navigate({
      to: LessonRoute.to,
      params: {
        projectId: project.id,
        lessonId: currentLesson + 1,
      },
    });
  }

  const h1 = project?.title + " - Lesson " + currentLesson;
  return (
    <nav className="heading">
      <button
        className="previous-lesson-btn"
        disabled={!canGoBack}
        onClick={() => goToPreviousLesson()}
        style={{ cursor: canGoBack ? "pointer" : "not-allowed" }}
      >
        {"<"}
      </button>
      <h1
        id="project-heading"
        // className={anim}
        dangerouslySetInnerHTML={{
          __html: h1,
        }}
      ></h1>
      {goToNextLesson && (
        <button
          className="next-lesson-btn"
          disabled={!canGoForward}
          onClick={() => goToNextLesson()}
          style={{ cursor: canGoForward ? "pointer" : "not-allowed" }}
        >
          {">"}
        </button>
      )}
    </nav>
  );
};
