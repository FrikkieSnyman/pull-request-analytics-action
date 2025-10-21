import { getValueAsIs } from "./getValueAsIs.js";
import { dateFormats } from "../constants.js";

export const getDateFormat = () => {
  const input = getValueAsIs("PERIOD_SPLIT_UNIT") as keyof typeof dateFormats;
  return dateFormats[input];
};
