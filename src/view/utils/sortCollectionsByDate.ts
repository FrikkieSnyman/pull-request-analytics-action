import { invalidDate } from './../../converters/constants.js';
import { isBefore, parse } from "date-fns";
import { Collection } from "../../converters/types.js";
import { getDateFormat } from "../../common/utils/index.js";

export const sortCollectionsByDate = (
  collections: Record<string, Collection>
) =>
  Object.keys(collections)
    .filter((key) => key !== invalidDate)
    .slice()
    .sort((a, b) => {
      if (a === "total") return 1;
      if (b === "total") return -1;
      return isBefore(
        parse(a, getDateFormat(), new Date()),
        parse(b, getDateFormat(), new Date())
      )
        ? 1
        : -1;
    });
