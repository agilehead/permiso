import js from "@eslint/js";
import typescript from "typescript-eslint";
import globals from "globals";

export default typescript.config(
  js.configs.recommended,
  ...typescript.configs.strictTypeChecked,
  ...typescript.configs.stylisticTypeChecked,

  // Base config for all TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },
    rules: {
      // Strict type imports
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      // Unused variables - allow underscore prefix
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // Require explicit return types on functions
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],

      // No floating promises
      "@typescript-eslint/no-floating-promises": "error",

      // No misused promises
      "@typescript-eslint/no-misused-promises": "error",

      // Require await for async functions
      "@typescript-eslint/require-await": "error",

      // Strict boolean expressions
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
        },
      ],

      // No unnecessary conditions
      "@typescript-eslint/no-unnecessary-condition": "error",

      // Prefer nullish coalescing
      "@typescript-eslint/prefer-nullish-coalescing": "error",

      // No console (except warn/error/info)
      "no-console": ["error", { allow: ["warn", "error", "info"] }],

      // Switch exhaustiveness
      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // No unsafe operations
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // No explicit any
      "@typescript-eslint/no-explicit-any": "error",

      // Prefer const
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Test files - relaxed rules
  {
    files: [
      "**/permiso-integration-tests/**/*.ts",
      "**/permiso-client/src/tests/**/*.ts",
      "**/permiso-test-utils/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-console": "off",
    },
    languageOptions: {
      globals: globals.mocha,
    },
  },

  // Ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "**/*.d.ts",
      "**/generated/**",
    ],
  },
);
