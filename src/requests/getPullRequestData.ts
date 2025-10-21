import { Repository } from "./types.js";

import { octokit } from "../octokit/index.js";
import { commonHeaders } from "./constants.js";

export const getPullRequestDatas = async (
  pullRequestNumbers: number[],
  repository: Repository
) => {
  const { repo, owner } = repository;
  return pullRequestNumbers.map((number) =>
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: number,
      headers: commonHeaders,
    })
  );
};
