import { Loader } from './loader';
import { TestType } from '../types';
import { parseMarkdown } from '../utils';

export const Test = ({ test_text, passed, is_loading, test_id }: TestType) => {
  return (
    <li className='test'>
      <span className={passed ? 'passed' : 'failed'}>
        {test_id + 1}) {is_loading ? <Loader size={'20'} /> : passed ? '✓' : '✗'}{' '}
      </span>
      <div
        style={{ display: 'inline' }}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(test_text) }}
      ></div>
    </li>
  );
};
