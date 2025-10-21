import {set, get} from "lodash";


import { invalidUserLogin } from "../constants.js";
import { Collection } from "../types.js";
import { checkUserInclusive } from "./calculations/index.js";

export const prepareRequestedReviews = (
  requests: any[] = [],
  collection: Record<string, Record<string, Collection>>,
  dateKey: string,
  teams: Record<string, string[]>
) => {
  const requestedReviewers = requests.reduce((acc, request) => {
    const user = request.requested_reviewer
      ? request.requested_reviewer?.login || invalidUserLogin
      : request.requested_team?.name || "Invalid Team";
    if(!checkUserInclusive(user)) return acc;
    return { ...acc, [user]: 1 };
  }, {});

  requestedReviewers["total"] = Object.keys(requestedReviewers).length;

  Object.keys(requestedReviewers).forEach((user) => {
    teams[user]?.forEach((team) => {
      requestedReviewers[team] = (requestedReviewers[team] || 0) + 1;
    });
  });

  [dateKey, "total"].forEach((date) => {
    Object.entries({ ...requestedReviewers }).forEach(([user, value]) => {
      if (checkUserInclusive(user)) {
        set(
          collection,
          [user, date, "reviewRequestsConducted"],
          get(collection, [user, date, "reviewRequestsConducted"], 0) +
            (value as number)
        );
      }
    });
  });
};
