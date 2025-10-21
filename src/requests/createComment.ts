import { getValueAsIs } from "../common/utils/index.js";
import { octokit } from "../octokit/index.js";
import { commonHeaders } from "./constants.js";

export const createComment = async (
  issueNumber: number,
  commentMarkdown: string
) =>
  octokit.rest.issues.createComment({
    repo: getValueAsIs("GITHUB_REPO_FOR_ISSUE"),
    owner: getValueAsIs("GITHUB_OWNER_FOR_ISSUE"),
    issue_number: issueNumber,
    body: commentMarkdown,
    headers: commonHeaders,
  });
