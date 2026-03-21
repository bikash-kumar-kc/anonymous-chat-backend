import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": [
        "warn", // or "error"
        {
          argsIgnorePattern: "^_", // ignores only function args starting with _
          vars: "all", // check all variables
          ignoreRestSiblings: false,
        },
      ],
    },
  },
]);
