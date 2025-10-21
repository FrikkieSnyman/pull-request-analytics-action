import { getMultipleValuesInput } from "./getMultipleValuesInput.js";

export const getOrgs = () => {
  const orgs = getMultipleValuesInput("ORGANIZATIONS");
  const repoOrgs = getMultipleValuesInput("GITHUB_OWNERS_REPOS").map(
    (repo) => repo.split("/")[0]
  );

  return [...new Set([...orgs, ...repoOrgs])];
};
