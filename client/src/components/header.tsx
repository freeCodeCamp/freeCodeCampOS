import { useQuery } from "@tanstack/react-query";
import FreeCodeCampLogo from "../assets/fcc_primary_large";
import { LanguageList } from "./language-list";
import { getConfig } from "../utils/fetch";
import { useNavigate } from "@tanstack/react-router";
import { LandingRoute } from "../templates/landing";

export const Header = () => {
  const navigate = useNavigate();
  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
  });

  if (configQuery.isPending) {
    return null;
  }

  if (configQuery.isError) {
    return <div>Error: {configQuery.error.message}</div>;
  }

  const config = configQuery.data;

  const locales = config?.curriculum?.locales
    ? Object.keys(config.curriculum?.locales)
    : [];
  return (
    <header>
      <button
        className="header-btn"
        onClick={() => {
          navigate({ to: LandingRoute.to });
        }}
      >
        <FreeCodeCampLogo />
      </button>
      {locales.length > 1 ? <LanguageList {...{ locales }} /> : null}
    </header>
  );
};
