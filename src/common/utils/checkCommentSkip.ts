import { showStatsTypes } from "../constants.js";
import { getMultipleValuesInput } from "./getMultipleValuesInput.js";

export const checkCommentSkip = () => {
  return ![
    showStatsTypes["pr-quality"],
    showStatsTypes["code-review-engagement"],
  ].some((block) => getMultipleValuesInput("SHOW_STATS_TYPES").includes(block));
};
