import { Description } from '../components/description';
import { Heading } from '../components/heading';
import { ConsoleError, F, LoaderT, ProjectI, TestType } from '../types';
import { Controls } from '../components/controls';
import { Output } from '../components/output';
import './project.css';

export interface ProjectProps {
  cancelTests: F<void, void>;
  goToNextLesson: F<void, void>;
  goToPreviousLesson: F<void, void>;
  resetProject: F<void, void>;
  runTests: F<void, void>;
  cons: ConsoleError[];
  description: string;
  hints: string[];
  loader: LoaderT;
  lesson_number: number;
  project: ProjectI;
  tests: TestType[];
}

export const Project = ({
  cancelTests,
  runTests,
  resetProject,
  goToNextLesson,
  goToPreviousLesson,
  loader,
  project,
  lesson_number,
  description,
  tests,
  hints,
  cons
}: ProjectProps) => {
  return (
    <>
      <div className='container'>
        <Heading
          {...(project.is_integrated
            ? { title: project.title }
            : {
                goToNextLesson,
                goToPreviousLesson,
                number_of_lessons: project.number_of_lessons,
                title: project.title,
                lesson_number
              })}
        />

        <Description description={description} />

        <Controls
          {...(project.is_integrated
            ? {
                cancelTests,
                runTests,
                tests
              }
            : {
                cancelTests,
                runTests,
                resetProject,
                is_reset_enabled: project.is_reset_enabled,
                tests,
                loader
              })}
        />

        <Output {...{ hints, tests, cons }} />
      </div>
    </>
  );
};
