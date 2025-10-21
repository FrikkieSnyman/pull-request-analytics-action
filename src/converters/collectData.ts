import { format, parseISO } from "date-fns";
import {set, get} from "lodash";

import { makeComplexRequest } from "../requests/index.js";
import { Collection } from "./types.js";
import {
  prepareReviews,
  prepareDiscussions,
  preparePullRequestInfo,
  preparePullRequestStats,
  preparePullRequestTimeline,
  prepareResponseTime,
  prepareRequestedReviews,
  prepareActionsTime,
} from "./utils/index.js";
import {
  invalidUserLogin,
  invalidDate,
  reviewRequestedTimelineEvent,
  reviewedTimelineEvent,
  readyForReviewTimelineEvent,
  convertToDraftTimelineEvent,
} from "./constants.js";
import { checkUserInclusive, getPullRequestSize } from "./utils/calculations/index.js";
import { getDateFormat } from "../common/utils/index.js";

export const collectData = (
  data: Awaited<ReturnType<typeof makeComplexRequest>>,
  teams: Record<string, string[]>
) => {
  const collection: Record<string, Record<string, Collection>> = { total: {} };

  data.pullRequestInfo.forEach((pullRequest, index) => {
    if (pullRequest === undefined || pullRequest === null) {
      return;
    }
    const reviews = data.events[index]?.filter(
      (el) => el.event === reviewedTimelineEvent
    );
    const reviewRequests = data.events[index]?.filter(
      (el) => el.event === reviewRequestedTimelineEvent
    );

    const statuses = data.events[index]?.filter((el) =>
      [readyForReviewTimelineEvent, convertToDraftTimelineEvent].includes(
        el.event as string
      )
    );

    prepareActionsTime(
      pullRequest,
      data.events[index]?.filter((el) => el),
      collection
    );

    const closedDate = pullRequest.closed_at
      ? parseISO(pullRequest.closed_at)
      : null;

    const dateKey =
      closedDate && getDateFormat()
        ? format(closedDate, getDateFormat())
        : invalidDate;

    const userKey = pullRequest.user?.login || invalidUserLogin;
    prepareRequestedReviews(reviewRequests, collection, dateKey, teams);

    ["total", userKey, ...(teams[userKey] || [])].forEach((key) => {
      ["total", dateKey].forEach((innerKey) => {
        if (checkUserInclusive(userKey)) {
          set(
            collection,
            [key, innerKey],
            preparePullRequestInfo(
              pullRequest,
              get(collection, [key, innerKey], {})
            )
          );
        }

        set(
          collection,
          [key, innerKey],
          preparePullRequestTimeline(
            pullRequest,
            reviews,
            reviewRequests?.[0],
            statuses,
            get(collection, [key, innerKey], {})
          )
        );
      });
    });

    prepareReviews(
      reviews,
      collection,
      dateKey,
      userKey,
      getPullRequestSize(pullRequest?.additions, pullRequest?.deletions),
      teams
    );
    prepareResponseTime(
      data.events[index],
      pullRequest,
      collection,
      dateKey,
      teams
    );
    prepareDiscussions(
      data.comments,
      collection,
      index,
      dateKey,
      userKey,
      teams
    );
  });

  Object.entries(collection).map(([key, value]) => {
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      set(collection, [key, innerKey], preparePullRequestStats(innerValue));
    });
  });

  return collection;
};
