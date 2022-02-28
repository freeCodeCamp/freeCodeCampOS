interface ProjectHeadingProps {
  topic: string;
  project: string;
  lessonNumber: number;
}

const ProjectHeading = ({
  topic,
  project,
  lessonNumber,
}: ProjectHeadingProps) => {
  return (
    <h1 id="project-heading">
      {topic} - {project} - Lesson
      <span id="lesson-number" className="sparkle">
        {lessonNumber}
      </span>
    </h1>
  );
};

export default ProjectHeading;
