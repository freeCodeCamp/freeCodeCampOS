import { Description } from '../components/description';
import { Heading } from '../components/heading';
import { ConsoleError, F, ProjectI, TestType } from '../types';
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
  hints: string;
  isLoading: boolean;
  lessonNumber: number;
  project: ProjectI;
  tests: TestType[];
}

export const Project = ({
  cancelTests,
  runTests,
  resetProject,
  goToNextLesson,
  goToPreviousLesson,
  isLoading,
  project,
  lessonNumber,
  description,
  tests,
  hints,
  cons
}: ProjectProps) => {
  return (
    <>
      <div className='container'>
        <Heading
          {...(project.isIntegrated
            ? { title: project.title }
            : {
                goToNextLesson,
                goToPreviousLesson,
                numberOfLessons: project.numberOfLessons,
                title: project.title,
                lessonNumber
              })}
        />

        <Description description={description} />

        <Controls
          {...(project.isIntegrated
            ? {
                cancelTests,
                runTests,
                tests
              }
            : {
                cancelTests,
                runTests,
                resetProject,
                isResetEnabled: project.isResetEnabled,
                tests
              })}
        />

        <Output
          {...(project.isIntegrated
            ? { isLoading, tests, cons }
            : { isLoading, hints, tests, cons })}
        />
      </div>
    </>
  );
};
