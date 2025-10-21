import { getValueAsIs } from "./getValueAsIs.js";

export const setTimezone = () => {
  const timezone = getValueAsIs("TIMEZONE");
  if (timezone) {
    process.env.TZ = timezone;
  }
};
