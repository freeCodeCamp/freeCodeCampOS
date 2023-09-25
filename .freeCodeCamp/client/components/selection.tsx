import { Events, ProjectI } from '../types';
import { Block } from './block';

export interface SelectionProps {
  sock: (type: Events, data: {}) => void;
  projects: ProjectI[];
}
export const Selection = ({ sock, projects }: SelectionProps) => {
  return (
    <ul className='blocks'>
      {projects.map((p, i) => {
        return <Block key={i} {...{ ...p, sock }} />;
      })}
    </ul>
  );
};
