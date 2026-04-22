import { dateFormats } from "../constants";
import { getValueAsIs } from "./env";

export const getDateFormat = () => {
  const input = getValueAsIs("PERIOD_SPLIT_UNIT") as keyof typeof dateFormats;
  return dateFormats[input];
};
