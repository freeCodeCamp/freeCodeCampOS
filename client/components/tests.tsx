import { TestType } from '../types';
import { Test } from './test';

interface TestsProps {
  tests: TestType[];
}

export const Tests = ({ tests }: TestsProps) => {
  return (
    <ul style={{ listStyle: 'none' }}>
      {tests.map(({ test_text, passed, is_loading, test_id, feedback }, i) => (
        <Test
          key={i}
          {...{
            test_text,
            passed,
            is_loading,
            test_id,
            feedback
          }}
        />
      ))}
    </ul>
  );
};
