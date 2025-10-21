import { octokit } from "../octokit/index.js";
import { commonHeaders } from "./constants.js";

export const getRateLimit = async () =>
  octokit.rest.rateLimit.get({ headers: commonHeaders });
