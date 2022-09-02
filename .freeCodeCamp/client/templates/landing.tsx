import { Selection } from '../components/selection';
import { Events } from '../types';
import freeCodeCampConfig from '../../../freecodecamp.conf.json' assert { type: 'json' };
import './landing.css';

interface LandingProps {
  topic: string;
  sock: (type: Events, data: {}) => void;
}

export const Landing = ({ topic, sock }: LandingProps) => {
  return (
    <>
      <h2>{topic}</h2>
      <p className='description'>
        {freeCodeCampConfig.client.landing.description}
      </p>
      <a className='faq' href={freeCodeCampConfig.client.landing['faq-link']}>
        {freeCodeCampConfig.client.landing['faq-text']}
      </a>
      <Selection {...{ topic, sock }} />
    </>
  );
};
