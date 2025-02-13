import { useQuery } from "@tanstack/react-query";
import { Selection } from "../components/selection";
import "./landing.css";
import { getConfig, getState, postState } from "../utils/fetch";
import { Loader } from "../components/loader";
import { rootRoute } from "../utils";
import { createRoute } from "@tanstack/react-router";

export const Landing = () => {
  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
  });

  const stateQuery = useQuery({
    queryKey: ["state"],
    queryFn: getState,
  });

  const postStateQuery = useQuery({
    queryKey: ["postState"],
    enabled: stateQuery.isSuccess,
    queryFn: async () => await postState({ currentProject: null }),
  });

  if (
    configQuery.isPending ||
    stateQuery.isPending ||
    postStateQuery.isPending
  ) {
    return <Loader />;
  }

  if (configQuery.isError) {
    return <div>Error: {configQuery.error.message}</div>;
  }

  if (stateQuery.isError) {
    return <div>Error: {stateQuery.error.message}</div>;
  }

  if (postStateQuery.isError) {
    return <div>Error: {postStateQuery.error.message}</div>;
  }

  const state = stateQuery.data;

  const config = configQuery.data;
  const landing = config.client.landing[state.locale];
  return (
    <>
      {landing.title && <h1>{landing.title}</h1>}
      <p className="description">{landing.description}</p>
      <a className="faq" href={landing["faq-link"]}>
        {landing["faq-text"]}
      </a>
      <Selection />
    </>
  );
};

export const LandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});
