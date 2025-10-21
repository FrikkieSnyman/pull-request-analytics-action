import { commonHeaders } from "./constants.js";
import { octokit } from "../octokit/index.js";
import { Repository } from "./types.js";

export const getPullRequestComments = async (
  pullRequestNumbers: number[],
  repository: Repository,
  options?: { skip: boolean }
) => {
  const { owner, repo } = repository;
  return !options?.skip
    ? pullRequestNumbers.map(async (number) => {
        const comments = await octokit.paginate(
          octokit.rest.pulls.listReviewComments,
          {
            owner,
            repo,
            pull_number: number,
            headers: commonHeaders,
            per_page: 100,
          }
        );

        return { data: comments };
      })
    : [];
};
