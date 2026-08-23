import { defineConfig, globalIgnores } from "eslint/config";

import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "node_modules/**"]),
  {
    rules: {
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "always", prev: "*", next: "import" },
        { blankLine: "always", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: ["const", "let", "var"], next: "function" },
        { blankLine: "always", prev: "function", next: ["const", "let", "var", "function"] },
        { blankLine: "always", prev: "class", next: "*" },
        { blankLine: "always", prev: "*", next: "class" },
      ],
    },
  },
]);
