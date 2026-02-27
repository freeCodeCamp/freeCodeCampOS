import { Events, FreeCodeCampConfigI, ProjectI } from '../types';
import FreeCodeCampLogo from '../assets/fcc_primary_large';
import { LanguageList } from './language-list';

interface HeaderProps {
  updateProject: (project: ProjectI | null) => void;
  freeCodeCampConfig: FreeCodeCampConfigI;
  sock: (type: Events, data: {}) => void;
}
export const Header = ({
  sock,
  updateProject,
  freeCodeCampConfig
}: HeaderProps) => {
  function returnToLanding() {
    updateProject(null);
  }

  const locales = freeCodeCampConfig?.curriculum?.locales
    ? Object.keys(freeCodeCampConfig?.curriculum?.locales)
    : [];
  return (
    <header>
      <button className='header-btn' onClick={returnToLanding}>
        <FreeCodeCampLogo />
      </button>
      {locales.length > 1 ? <LanguageList {...{ sock, locales }} /> : null}
    </header>
  );
};
