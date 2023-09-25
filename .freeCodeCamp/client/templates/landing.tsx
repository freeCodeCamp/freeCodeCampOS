import { Selection } from '../components/selection';
import { Events, FreeCodeCampConfigI, ProjectI } from '../types';
import './landing.css';

interface LandingProps {
  sock: (type: Events, data: {}) => void;
  projects: ProjectI[];
  freeCodeCampConfig: FreeCodeCampConfigI;
}

export const Landing = ({
  sock,
  projects,
  freeCodeCampConfig
}: LandingProps) => {
  return (
    <>
      <p className='description'>
        {freeCodeCampConfig.client?.landing?.description}
      </p>
      <a
        className='faq'
        href={freeCodeCampConfig.client?.landing?.['faq-link']}
      >
        {freeCodeCampConfig.client?.landing?.['faq-text']}
      </a>
      <Selection {...{ sock, projects }} />
    </>
  );
};
