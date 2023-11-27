import { useEffect, useState } from 'react';
import { F, ProjectI, TestType } from '../types';

interface ControlsProps {
  cancelTests: F<void, void>;
  runTests: F<void, void>;
  resetProject?: F<void, void>;
  isResetEnabled?: ProjectI['isResetEnabled'];
  tests: TestType[];
}

export const Controls = ({
  cancelTests,
  runTests,
  resetProject,
  isResetEnabled,
  tests
}: ControlsProps) => {
  const [isTestsRunning, setIsTestsRunning] = useState(false);

  useEffect(() => {
    if (tests.some(t => t.isLoading)) {
      setIsTestsRunning(true);
    } else {
      setIsTestsRunning(false);
    }
  }, [tests]);

  function handleTests() {
    if (isTestsRunning) {
      cancelTests();
    } else {
      runTests();
    }
  }

  return (
    <section className='project-controls'>
      <button className='secondary-cta' onClick={handleTests}>
        {isTestsRunning ? 'Cancel Tests' : 'Run Tests'}
      </button>
      {resetProject && (
        <button
          disabled={!isResetEnabled}
          style={isResetEnabled ? {} : { cursor: 'not-allowed' }}
          onClick={() => resetProject()}
        >
          Reset Step
        </button>
      )}
    </section>
  );
};
