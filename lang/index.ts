import enUs from "./en-us";
import viVn from "./vi-vn";

import { deepmerge } from "deepmerge-ts";

const langs = {
  "en-us": enUs,
  "vi-vn": deepmerge(enUs, viVn),
} as const;

export default langs;
