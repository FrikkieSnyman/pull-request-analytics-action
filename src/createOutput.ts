// import * as core from "@actions/core";
import { getMultipleValuesInput, getValueAsIs } from "./common/utils/index.js";
import { Collection } from "./converters/index.js";
import { createMarkdown } from "./view/index.js";
import { clearComments, createComment, createIssue } from "./requests/index.js";
import {
  createDependencyMarkdown,
  createTimelineMonthComparisonChart,
  getDisplayUserList,
  sortCollectionsByDate,
} from "./view/utils/index.js";
import { octokit } from "./octokit/index.js";
import { showStatsTypes } from "./common/constants.js";
import { createActivityTimeMarkdown } from "./view/utils/createActivityTimeMarkdown.js";
import fs from "fs";

export const createOutput = async (
  data: Record<string, Record<string, Collection>>
) => {
  const outcomes = getMultipleValuesInput("EXECUTION_OUTCOME");
  for ( let outcome of outcomes) {
    const users = getDisplayUserList(data);
    const dates = sortCollectionsByDate(data.total);

    if (outcome === "new-issue" || outcome === "existing-issue") {
      const issueNumber =
        outcome === "existing-issue" ? getValueAsIs("ISSUE_NUMBER") : undefined;
      const markdown = createMarkdown(
        data,
        users,
        ["total"],
        "Pull Request report total"
      );
      if (outcome.includes("existing-issue")) {
        await clearComments(issueNumber);
      }
      const issue = await createIssue(markdown, issueNumber);
      const monthComparison = createTimelineMonthComparisonChart(
        data,
        dates,
        users,
        [
          {
            title: "Pull Request report total",
            link: `${issue.data.html_url}#`,
          },
        ]
      );
      const comments = [];
      if (monthComparison) {
        const comparisonComment = await octokit.rest.issues.createComment({
          repo: getValueAsIs("GITHUB_REPO_FOR_ISSUE"),
          owner: getValueAsIs("GITHUB_OWNER_FOR_ISSUE"),
          issue_number: issue.data.number,
          body: monthComparison,
        });
        comments.push({
          comment: comparisonComment,
          title: "retrospective timeline",
        });
      }

      if (getValueAsIs("SHOW_CORRELATION_GRAPHS") === "true") {
        const dependencyComment = await octokit.rest.issues.createComment({
          repo: getValueAsIs("GITHUB_REPO_FOR_ISSUE"),
          owner: getValueAsIs("GITHUB_OWNER_FOR_ISSUE"),
          issue_number: issue.data.number,
          body: createDependencyMarkdown(data, users, [
            {
              title: "Pull Request report total",
              link: `${issue.data.html_url}#`,
            },
          ]),
        });
        comments.push({
          comment: dependencyComment,
          title: "Correlation Graphs",
        });
      }
      if (getValueAsIs("SHOW_ACTIVITY_TIME_GRAPHS") === "true") {
        const activityComment = await octokit.rest.issues.createComment({
          repo: getValueAsIs("GITHUB_REPO_FOR_ISSUE"),
          owner: getValueAsIs("GITHUB_OWNER_FOR_ISSUE"),
          issue_number: issue.data.number,
          body: createActivityTimeMarkdown(data, users, [
            {
              title: "Pull Request report total",
              link: `${issue.data.html_url}#`,
            },
          ]),
        });
        comments.push({
          comment: activityComment,
          title: "Activity time Graphs",
        });
      }
      console.log("Issue successfully created.");
      for (let date of dates) {
        if (date === "total") continue;
        const commentMarkdown = createMarkdown(
          data,
          users,
          [date],
          `Pull Request report ${date}`,
          [
            {
              title: "Pull Request report total",
              link: `${issue.data.html_url}#`,
            },
          ]
        );
        if (commentMarkdown === "" || dates.length < 3) continue;
        const comment = await createComment(issue.data.number, commentMarkdown);
        comments.push({ comment, title: date });
      }
      await createIssue(
        createMarkdown(
          data,
          users,
          ["total"],
          "Pull Request report total",
          comments.map((comment) => ({
            title: `Pull Request report ${comment.title}`,
            link: comment.comment.data.html_url,
          }))
        ),
        issue.data.number
      );
    }

    if (outcome === "file") {
      const monthComparison = getMultipleValuesInput(
        "SHOW_STATS_TYPES"
      ).includes(showStatsTypes.timeline)
        ? createTimelineMonthComparisonChart(data, dates, users)
        : "";
      const markdown = createMarkdown(data, users, dates).concat(
        `\n${monthComparison}`
      );
      console.log("Markdown successfully generated.");
      if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
      }
      fs.writeFileSync('reports/pull-requests-report.md', markdown, 'utf8');
      console.log('Markdown file successfully written to pull-requests-report.md');
    }

    if (outcome === "markdown") {
      const monthComparison = getMultipleValuesInput(
        "SHOW_STATS_TYPES"
      ).includes(showStatsTypes.timeline)
        ? createTimelineMonthComparisonChart(data, dates, users)
        : "";
      const markdown = createMarkdown(data, users, dates).concat(
        `\n${monthComparison}`
      );
      console.log("Markdown successfully generated.");
      // core.setOutput("MARKDOWN", markdown);
    }
    if (outcome === "collection") {
      // core.setOutput("JSON_COLLECTION", JSON.stringify(data));
    }
  }
};
