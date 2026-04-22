import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { getValueAsIs } from "../common/utils";
import { setFailed } from "../common/utils/env";

Octokit.plugin(throttling);

const defaultBaseUrl = "https://api.github.com";

export const octokit = new Octokit({
  baseUrl: process.env["GITHUB_API_URL"] || defaultBaseUrl,
  auth: getValueAsIs("GITHUB_TOKEN"),
  throttle: {
    onSecondaryRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.error(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}. ${retryCount} retries, retry after ${retryAfter} seconds.`
      );
      if (retryCount < 2) {
        // only retries twice
        octokit.log.info(`Retrying after ${retryAfter} seconds! ${retryCount} retries.`);
        return true;
      }
      setFailed(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      );
      throw `SecondaryRateLimit detected for request ${options.method} ${options.url}`;
    },
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.error(
        `Request quota exhausted for request ${options.method} ${options.url}. ${retryCount} retries, retry after ${retryAfter} seconds.`
      );
      if (retryCount < 2) {
        // only retries twice
        octokit.log.info(`Retrying after ${retryAfter} seconds! ${retryCount} retries.`);
        return true;
      }
      setFailed(
        `Request quota exhausted for request ${options.method} ${options.url}`
      );
      throw `Request quota exhausted for request ${options.method} ${options.url}`;
    },
    enabled: true,
  },
});
