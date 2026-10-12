import { defineConfig, globalIgnores } from "eslint/config";

import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "node_modules/**", "generated/**"]),
  {
    rules: {
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "class", next: "*" },
        { blankLine: "always", prev: "*", next: "class" },
      ],
    },
  },
]);
