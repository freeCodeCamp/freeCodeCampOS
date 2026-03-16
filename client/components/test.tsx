import { Loader } from './loader';
import { TestType } from '../types';
import { parseMarkdown } from '../utils';

export const Test = ({
  test_text,
  passed,
  is_loading,
  test_id,
  error,
  index
}: TestType & { index: number }) => {
  return (
    <li className='test'>
      <span className={passed ? 'passed' : 'failed'}>
        {index + 1}) {is_loading ? <Loader size={'20'} /> : passed ? '✓' : '✗'}{' '}
      </span>
      <div
        style={{ display: 'inline' }}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(test_text) }}
      ></div>
      {!passed && !is_loading && error && (
        <div
          className='test-feedback'
          style={{ marginLeft: '20px', fontSize: '0.9em', color: '#ffadad' }}
        >
          {error.message}
        </div>
      )}
    </li>
  );
};
