import { F } from "../types";

interface HeaderProps {
  goToNextLesson?: F<void, void>;
  goToPreviousLesson?: F<void, void>;
}

const Header = ({ goToNextLesson, goToPreviousLesson }: HeaderProps) => {
  return (
    <header>
      {goToPreviousLesson && (
        <button onClick={() => goToPreviousLesson()}>Previous</button>
      )}
      <img
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/main/build/platform/universal/fcc_primary.svg"
        id="logo"
        alt="freeCodeCamp logo"
      />
      {goToNextLesson && <button onClick={() => goToNextLesson()}>Next</button>}
    </header>
  );
};

export default Header;
