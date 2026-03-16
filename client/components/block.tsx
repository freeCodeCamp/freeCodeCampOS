import { SelectionProps } from './selection';
import { ProjectI, Events } from '../types/index';
import { Tag } from './tag';
import { Checkmark } from './checkmark';
import { parseMarkdown } from '../utils';

type BlockProps = {
  sock: SelectionProps['sock'];
} & ProjectI;

export const Block = ({
  id,
  title,
  description,
  is_integrated,
  is_public,
  number_of_lessons,
  current_lesson,
  completed_date,
  tags,
  sock
}: BlockProps) => {
  function selectProject() {
    sock(Events.SELECT_PROJECT, { id });
  }

  let lessonsCompleted = 0;
  if (completed_date) {
    lessonsCompleted = number_of_lessons;
  } else {
    lessonsCompleted =
      !is_integrated && current_lesson === number_of_lessons - 1
        ? current_lesson + 1
        : current_lesson;
  }
  return (
    <li className='block'>
      <button
        className='block-btn'
        onClick={selectProject}
        disabled={!is_public}
        style={
          !is_public
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
          {completed_date ? (
            <span className='block-checkmark'>
              <Checkmark />
            </span>
          ) : null}
        </h2>
        <div className='block-info'>
          <p
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(description)
            }}
          ></p>
          <span aria-hidden='true'>
            {lessonsCompleted}/{number_of_lessons}
          </span>
          <span className='sr-only'>
            {lessonsCompleted} of {number_of_lessons} lessons completed
          </span>
        </div>
      </button>
    </li>
  );
};
