import { Collection } from "../../converters/types.js";
import {
  timeInDraftHeader,
  timeToApproveHeader,
  timeToMergeHeader,
  timeToReviewHeader,
  timeToReviewRequestHeader,
} from "./constants.js";
import { createGanttBar } from "./common/index.js";
import { StatsType } from "./types.js";
import { formatMinutesDuration } from "./formatMinutesDuration.js";
import { getValueAsIs } from "../../common/utils/index.js";

export const createTimelineGanttBar = (
  data: Record<string, Record<string, Collection>>,
  type: StatsType,
  users: string[],
  date: string
) => {
  if (
    !users.some(
      (user) =>
        data[user]?.[date]?.[type]?.timeToReview &&
        data[user]?.[date]?.[type]?.timeToApprove &&
        data[user]?.[date]?.[type]?.timeToMerge
    )
  ) {
    return "";
  }
  return createGanttBar({
    title: `Pull requests timeline(${
      type === "percentile" ? parseInt(getValueAsIs("PERCENTILE")) : ""
    }${type === "percentile" ? "th " : ""}${type}) ${date} / minutes`,
    sections: users
      .filter(
        (user) =>
          data[user]?.[date]?.[type]?.timeToReview &&
          data[user]?.[date]?.[type]?.timeToApprove &&
          data[user]?.[date]?.[type]?.timeToMerge
      )
      .map((user) => ({
        name: user,
        bars: [
          {
            name: timeInDraftHeader,
            start: 0,
            end: data[user]?.[date]?.[type]?.timeInDraft || 0,
          },
          {
            name: timeToReviewRequestHeader,
            start: 0,
            end: data[user]?.[date]?.[type]?.timeToReviewRequest || 0,
          },
          {
            name: timeToReviewHeader,
            start: 0,
            end: data[user]?.[date]?.[type]?.timeToReview || 0,
          },
          {
            name: timeToApproveHeader,
            start: 0,
            end: data[user]?.[date]?.[type]?.timeToApprove || 0,
          },
          {
            name: timeToMergeHeader,
            start: 0,
            end: data[user]?.[date]?.[type]?.timeToMerge || 0,
          },
        ].filter((bar) => bar.end > 0),
      })),
    formatValue: (value) => formatMinutesDuration(value),
  });
};
