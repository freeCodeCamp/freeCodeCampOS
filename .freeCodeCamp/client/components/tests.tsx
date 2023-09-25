import { TestType } from '../types';
import { Test } from './test';

interface TestsProps {
  tests: TestType[];
}

export const Tests = ({ tests }: TestsProps) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {tests.map(({ testText, passed, isLoading, testId }, i) => (
        <Test
          key={i}
          {...{
            testText,
            passed,
            isLoading,
            testId
          }}
        />
      ))}
    </ul>
  );
};
