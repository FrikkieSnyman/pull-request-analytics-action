import { getValueAsIs } from "../common/utils/index.js";
import { octokit } from "../octokit/index.js";
import { commonHeaders } from "./constants.js";

export const clearComments = async (issueNumber?: string) => {
  if (!issueNumber) return;
  const comments = await octokit.rest.issues.listComments({
    repo: getValueAsIs("GITHUB_REPO_FOR_ISSUE"),
    owner: getValueAsIs("GITHUB_OWNER_FOR_ISSUE"),
    issue_number: parseInt(issueNumber),
  });
  for (let comment of comments.data) {
    await octokit.rest.issues.deleteComment({
      repo: getValueAsIs("GITHUB_REPO_FOR_ISSUE"),
      owner: getValueAsIs("GITHUB_OWNER_FOR_ISSUE"),
      comment_id: comment.id,
      headers: commonHeaders,
    });
  }
};
