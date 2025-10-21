import { commonHeaders } from "./constants.js";
import { octokit } from "../octokit/index.js";
import { Repository } from "./types.js";

export const getIssueTimelineEvents = async (
  issueNumbers: number[],
  repository: Repository
) => {
  const { owner, repo } = repository;
  return issueNumbers.map(async (number) => {
    const events = await octokit.paginate(
      octokit.rest.issues.listEventsForTimeline,
      {
        owner,
        repo,
        issue_number: number,
        headers: commonHeaders,
        per_page: 100
      }
    );
    return { data: events };
  });
};
