import { SelectionProps } from './selection';
import { ProjectI, Events, ProjectState } from '../types/index';
import { Tag } from './tag';
import { Checkmark } from './checkmark';

type BlockProps = {
  sock: SelectionProps['sock'];
  project: ProjectI;
  projectState: ProjectState;
};

export const Block = ({
  project: {
    id,
    title,
    description,
    isIntegrated,
    isPublic,
    numberOfLessons,
    tags
  },
  projectState: { currentLesson, completedDate },
  sock
}: BlockProps) => {
  function selectProject() {
    sock(Events.SELECT_PROJECT, { id });
  }

  let lessonsCompleted = 0;
  if (completedDate) {
    lessonsCompleted = numberOfLessons;
  } else {
    lessonsCompleted =
      !isIntegrated && currentLesson === numberOfLessons - 1
        ? currentLesson + 1
        : currentLesson;
  }
  return (
    <li className='block'>
      <button
        className='block-btn'
        onClick={selectProject}
        disabled={!isPublic}
        style={
          !isPublic
            ? {
                cursor: 'not-allowed'
              }
            : {}
        }
      >
        <div className={'tags-row'}>
          {tags.map(text => {
            return <Tag text={text} />;
          })}
        </div>

        <h2>
          {title}
          {completedDate ? (
            <span className='block-checkmark'>
              <Checkmark />
            </span>
          ) : null}
        </h2>
        <div className='block-info'>
          <p
            dangerouslySetInnerHTML={{
              __html: description
            }}
          ></p>
          <span aria-hidden='true'>
            {lessonsCompleted}/{numberOfLessons}
          </span>
          <span className='sr-only'>
            {lessonsCompleted} of {numberOfLessons} lessons completed
          </span>
        </div>
      </button>
    </li>
  );
};
