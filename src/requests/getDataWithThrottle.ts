import { checkCommentSkip } from "../common/utils/index.js";
import { concurrentLimit } from "./constants.js";
import { delay } from "./delay.js";
import { getIssueTimelineEvents } from "./getIssueTimelineEvents.js";
import { getPullRequestComments } from "./getPullRequestComments.js";
import { getPullRequestDatas } from "./getPullRequestData.js";
import { Options, Repository } from "./types.js";

export const getDataWithThrottle = async (
  pullRequestNumbers: number[],
  repository: Repository,
  options: Options
) => {
  const PRs = [];
  const PREvents = [];
  const PRComments = [];
  let counter = 0;
  const { skipComments = true } = options;
  while (pullRequestNumbers.length > PRs.length) {
    const startIndex = counter * concurrentLimit;
    const endIndex = (counter + 1) * concurrentLimit;
    const pullRequestNumbersChunks = pullRequestNumbers.slice(
      startIndex,
      endIndex
    );
    const pullRequestDatas = await getPullRequestDatas(
      pullRequestNumbersChunks,
      repository
    );
    console.log(
      `Batch request #${counter + 1} out of ${Math.ceil(
        pullRequestNumbers.length / concurrentLimit
      )}(${repository.owner}/${repository.repo})`
    );
    const prs = await Promise.allSettled(pullRequestDatas);
    await delay(5000);

    const pullRequestEvents = await getIssueTimelineEvents(
      pullRequestNumbersChunks,
      repository
    );
    const events = await Promise.allSettled(pullRequestEvents);
    await delay(5000);

    const pullRequestComments = await getPullRequestComments(
      pullRequestNumbersChunks,
      repository,
      {
        skip: skipComments,
      }
    );

    const comments = await Promise.allSettled(pullRequestComments);
    await delay(checkCommentSkip() ? 0 : 5000);
    counter++;
    PRs.push(...prs);
    PRComments.push(...comments);
    PREvents.push(...events);
  }
  return { PRs, PREvents, PRComments };
};
