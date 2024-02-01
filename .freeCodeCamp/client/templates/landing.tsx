import { Selection } from '../components/selection';
import { Events, FreeCodeCampConfigI, ProjectI } from '../types';
import './landing.css';

interface LandingProps {
  sock: (type: Events, data: {}) => void;
  projects: ProjectI[];
  freeCodeCampConfig: FreeCodeCampConfigI;
  locale: string;
}

export const Landing = ({
  sock,
  projects,
  freeCodeCampConfig,
  locale
}: LandingProps) => {
  return (
    <>
      <p className='description'>
        {freeCodeCampConfig.client?.landing?.[locale]?.description}
      </p>
      <a
        className='faq'
        href={freeCodeCampConfig.client?.landing?.[locale]?.['faq-link']}
      >
        {freeCodeCampConfig.client?.landing?.[locale]?.['faq-text']}
      </a>
      <Selection {...{ sock, projects }} />
    </>
  );
};
