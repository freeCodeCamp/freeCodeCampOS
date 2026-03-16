import { useRef, useState } from 'react';
import { LanguageGlobe } from './language-globe';
import { Events } from '../types';

type LanguageListProps = {
  locales: string[];
  sock: (type: Events, data: {}) => void;
};

export function LanguageList({ locales, sock }: LanguageListProps) {
  const [showList, setShowList] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const handleClick = (): void => {
    if (listRef.current) {
      if (showList) {
        listRef.current.classList.add('hidden');
        setShowList(false);
        return;
      }
      listRef.current.classList.remove('hidden');
      setShowList(true);
    }
  };

  const handleLanguageChange = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    const selectedLanguage = event.currentTarget.dataset.value;
    if (selectedLanguage === undefined) return;
    sock(Events.CHANGE_LANGUAGE, { locale: selectedLanguage });
  };

  return (
    <>
      <button
        id='toggle-lang-button'
        aria-expanded={showList}
        onClick={handleClick}
      >
        <LanguageGlobe />
      </button>
      <ul
        id='nav-lang-list'
        ref={listRef}
        className='hidden'
        aria-labelledby='toggle-lang-button'
      >
        {locales.map(lang => (
          <li key={'lang-' + lang}>
            <button data-value={lang} onClick={handleLanguageChange}>
              {lang}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
