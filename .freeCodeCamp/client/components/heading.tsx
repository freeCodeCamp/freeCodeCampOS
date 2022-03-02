interface HeadingProps {
  topic: string;
  project: string;
  lessonNumber?: number;
}

const Heading = ({ topic, project, lessonNumber }: HeadingProps) => {
  return (
    <h1 id="project-heading">
      {topic} - {project}
      {lessonNumber && <LessonNumber lessonNumber={lessonNumber} />}
    </h1>
  );
};

const LessonNumber = ({ lessonNumber }: { lessonNumber: number }) => {
  return (
    <>
      {" "}
      - Lesson{" "}
      <span id="lesson-number" className="sparkle">
        {lessonNumber}
      </span>
    </>
  );
};

export default Heading;
