import { TestType } from '../types';
import { Test } from './test';

interface TestsProps {
  hasRunTests: boolean;
  tests: TestType[];
}

export const Tests = ({ hasRunTests, tests }: TestsProps) => {
  if (!hasRunTests) {
    return <p>Click &apos;Run Tests&apos; to see results.</p>;
  }
  return (
    <ul style={{ listStyle: 'none' }}>
      {tests.map(({ test_text, passed, is_loading, test_id, error }, i) => (
        <Test
          key={i}
          index={i}
          {...{
            test_text,
            passed,
            is_loading,
            test_id,
            error
          }}
        />
      ))}
    </ul>
  );
};
