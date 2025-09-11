import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]
  },
  {
    // This section overrides the default rules.
    rules: {
      // The following rule is disabled to allow the use of "@ts-ignore".
      // The default configuration in "next/typescript" suggests using "@ts-expect-error" instead.
      "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-explicit-any": "off",
            " @typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars-experimental": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-wrapper-object-types": "off",
            "react-hooks/rules-of-hooks": "off"
    },
  },
];

export default eslintConfig;
