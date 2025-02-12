import { useEffect, useState } from 'react';
import { F } from '../types';

interface HeadingProps {
  title: string;
  lessonNumber?: number;
  numberOfLessons?: number;
  goToNextLesson?: F<void, void>;
  goToPreviousLesson?: F<void, void>;
}

export const Heading = ({
  title,
  lessonNumber,
  numberOfLessons,
  goToNextLesson,
  goToPreviousLesson
}: HeadingProps) => {
  const [anim, setAnim] = useState('');

  useEffect(() => {
    setAnim('fade-in');
    setTimeout(() => setAnim(''), 1000);
  }, [lessonNumber]);

  const lessonNumberExists = typeof lessonNumber !== 'undefined';
  const canGoBack = lessonNumberExists && lessonNumber > 0;
  const canGoForward =
    lessonNumberExists && numberOfLessons && lessonNumber < numberOfLessons - 1;

  const h1 = title + (lessonNumberExists ? ' - Lesson ' + lessonNumber : '');
  return (
    <nav className='heading'>
      {goToPreviousLesson && (
        <button
          className='previous-lesson-btn'
          disabled={!canGoBack}
          onClick={() => goToPreviousLesson()}
          style={{ cursor: canGoBack ? 'pointer' : 'not-allowed' }}
        >
          {'<'}
        </button>
      )}
      <h1
        id='project-heading'
        className={anim}
        dangerouslySetInnerHTML={{
          __html: h1
        }}
      ></h1>
      {goToNextLesson && (
        <button
          className='next-lesson-btn'
          disabled={!canGoForward}
          onClick={() => goToNextLesson()}
          style={{ cursor: canGoForward ? 'pointer' : 'not-allowed' }}
        >
          {'>'}
        </button>
      )}
    </nav>
  );
};
