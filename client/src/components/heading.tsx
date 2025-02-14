import { useNavigate } from "@tanstack/react-router";
import { LessonRoute } from "../templates/project";
import { useEffect, useState } from "react";

interface HeadingProps {
  projectId: number;
  currentLesson: number;
  numberOfLessons: number;
  title: string;
}

export const Heading = ({
  projectId,
  currentLesson,
  numberOfLessons,
  title,
}: HeadingProps) => {
  const navigate = useNavigate();
  const [anim, setAnim] = useState("");

  const canGoBack = currentLesson > 0;
  const canGoForward = currentLesson < numberOfLessons - 1;

  useEffect(() => {
    setAnim("fade-in");
    setTimeout(() => setAnim(""), 1000);
  }, [currentLesson]);

  function goToPreviousLesson() {
    if (!canGoBack) {
      return;
    }
    navigate({
      to: LessonRoute.to,
      params: {
        projectId,
        lessonId: currentLesson - 1,
      },
    });
  }

  function goToNextLesson() {
    if (!canGoForward) {
      return;
    }
    navigate({
      to: LessonRoute.to,
      params: {
        projectId,
        lessonId: currentLesson + 1,
      },
    });
  }

  const h1 = title + " - Lesson " + currentLesson;
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
        className={anim}
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
