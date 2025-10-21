import { getMultipleValuesInput } from "../../common/utils/index.js";
import { Collection } from "../../converters/index.js";
import { createReferences } from "./createReferences.js";
import { createSizeDependencyXYChart } from "./createSizeDependencyXYChart.js";
import { StatsType } from "./types.js";

export const createDependencyMarkdown = (
  data: Record<string, Record<string, Collection>>,
  users: string[],
  references: { title: string; link: string }[] = []
) => {
  const charts = users
    .filter((user) => Object.keys(data[user]?.total?.sizes || {}).length > 1)
    .map((user) => {
      return getMultipleValuesInput("AGGREGATE_VALUE_METHODS")
        .map((type) =>
          createSizeDependencyXYChart(data, type as StatsType, user)
        )
        .join("\n");
    })
    .join("\n");

  return [createReferences(references)].concat(charts).join("\n").trim();
};
