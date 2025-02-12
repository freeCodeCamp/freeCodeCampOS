import { Selection } from '../components/selection';
import { Events, FreeCodeCampConfigI, ProjectI, State } from '../types';
import './landing.css';

interface LandingProps {
  sock: (type: Events, data: {}) => void;
  projects: ProjectI[];
  freeCodeCampConfig: FreeCodeCampConfigI;
  locale: string;
  state: State;
}

export const Landing = ({
  sock,
  projects,
  freeCodeCampConfig,
  locale,
  state
}: LandingProps) => {
  const title = freeCodeCampConfig.client?.landing?.[locale]?.title;
  return (
    <>
      {title && <h1>{title}</h1>}
      <p className='description'>
        {freeCodeCampConfig.client?.landing?.[locale]?.description}
      </p>
      <a
        className='faq'
        href={freeCodeCampConfig.client?.landing?.[locale]?.['faq-link']}
      >
        {freeCodeCampConfig.client?.landing?.[locale]?.['faq-text']}
      </a>
      <Selection {...{ sock, state, projects }} />
    </>
  );
};
