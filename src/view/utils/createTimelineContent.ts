import { getMultipleValuesInput, getValueAsIs } from "../../common/utils/index.js";
import { Collection } from "../../converters/types.js";
import { createList } from "./common/index.js";
import { createTimelineGanttBar } from "./createTimelineGanttBar.js";
import { createTimelineTable } from "./createTimelineTable.js";
import { StatsType } from "./types.js";
import { formatMinutesDuration } from "./formatMinutesDuration.js";
import { createTimelinePieChart } from "./createTimelinePieChart.js";

type Type = "timeToReview" | "timeToApprove" | "timeToMerge";

export const createTimelineContent = (
  data: Record<string, Record<string, Collection>>,
  users: string[],
  date: string
) => {
  const milestoneTitle = {
    timeToReview: "longest-pending reviews",
    timeToApprove: "longest-pending approvals",
    timeToMerge: "longest-pending merge",
  } as Record<Type, string>;
  const problematicList = (
    ["timeToReview", "timeToApprove", "timeToMerge"] as Type[]
  )
    .map((milestone) => {
      const items =
        data.total?.[date]?.pullRequestsInfo
          ?.slice()
          ?.sort((a, b) => b[milestone] - a[milestone])
          .slice(0, parseInt(getValueAsIs("TOP_LIST_AMOUNT")))
          .map((item) => ({
            text: `${item.title}(${
              formatMinutesDuration(item[milestone]) || "-"
            })(Author: ${item.author})`,
            link: item.link || "",
          })) || [];
      return createList(milestoneTitle[milestone], items);
    })
    .filter((item) => item)
    .join("\n");

  const timeline = getMultipleValuesInput("AGGREGATE_VALUE_METHODS")
    .filter((method) => ["average", "median", "percentile"].includes(method))
    .map((type) => {
      const pullRequestTimelineTable = createTimelineTable(
        data,
        type as StatsType,
        users,
        date
      );
      const pullRequestTimelineBar = createTimelineGanttBar(
        data,
        type as StatsType,
        users,
        date
      );

      return `
${
  getValueAsIs("USE_CHARTS") === "true"
    ? pullRequestTimelineBar
    : pullRequestTimelineTable
}
`;
    })
    .join("\n");

  return `
  ${timeline}
  ${createTimelinePieChart(data, users, date, "reviewTimeIntervals")}
  ${createTimelinePieChart(data, users, date, "approvalTimeIntervals")}
  ${createTimelinePieChart(data, users, date, "mergeTimeIntervals")}
  ${problematicList}
  `;
};
