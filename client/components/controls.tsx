import { useEffect, useState } from 'react';
import { F, LoaderT, ProjectI, TestType } from '../types';

interface ControlsProps {
  cancelTests: F<void, void>;
  runTests: F<void, void>;
  resetProject?: F<void, void>;
  is_reset_enabled?: ProjectI['is_reset_enabled'];
  tests: TestType[];
  loader?: LoaderT;
}

// Changes the Reset button background to a filling progress bar when the seed is running
function progressStyle(loader?: LoaderT) {
  if (!loader) {
    return {};
  }

  const {
    is_loading,
    progress: { total, count }
  } = loader;
  if (is_loading) {
    return {
      background: `linear-gradient(to right, #0065A9 ${
        (count / total) * 100
      }%, rgba(0,0,0,0) 0%)`
    };
  }
}

export const Controls = ({
  cancelTests,
  runTests,
  resetProject,
  is_reset_enabled,
  tests,
  loader
}: ControlsProps) => {
  const [isTestsRunning, setIsTestsRunning] = useState(false);

  useEffect(() => {
    if (tests.some(t => t.is_loading)) {
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

  const resetDisabled = !is_reset_enabled || loader?.is_loading;

  return (
    <section className='project-controls'>
      <button className='secondary-cta' onClick={handleTests}>
        {isTestsRunning ? 'Cancel Tests' : 'Run Tests'}
      </button>
      {resetProject && (
        <button
          disabled={resetDisabled}
          style={{
            ...progressStyle(loader),
            cursor: resetDisabled ? 'not-allowed' : 'pointer'
          }}
          onClick={() => resetProject()}
        >
          Reset Step
        </button>
      )}
    </section>
  );
};
