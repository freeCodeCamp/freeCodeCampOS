import { useEffect, useState } from 'react';
import { Events, ProjectI } from '../types';
// import projects from '../../config/projects.json' assert { type: 'json' };
import { Block } from './block';


export interface SelectionProps {
  sock: (type: Events, data: {}) => void;
}
export const Selection = ({ sock }: SelectionProps) => {
  const [projects, setProjects] = useState<ProjectI[]>([]);

  useEffect(() => {
    (async () => {
      const ps = await import(process.env.CONFIG_PROJECTS || '../../../../config/projects.json', { assert: { type: 'json' } });
      setProjects(ps.default as ProjectI[]);
    })();
  }, []);
  return (
    <ul className='blocks'>
      {/* @ts-ignore TODO */}
      {projects.map((p, i) => {
        return <Block key={i} {...{ ...p, sock }} />;
      })}
    </ul>
  );
};
