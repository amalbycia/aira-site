import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prettier last — disables ESLint rules that conflict with Prettier formatting.
  prettierConfig,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".sanity/**"]),
]);

export default eslintConfig;
