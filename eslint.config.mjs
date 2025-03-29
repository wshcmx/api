
import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  [
    globalIgnores(["build/*"])
  ],
  {
    rules: {
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-namespace": "off",
      "multiline-ternary": ["error", "always-multiline"],
      "no-unneeded-ternary": "error",
      "no-nested-ternary": "error",
      "no-unused-vars": "error",
      "no-global-assign": "off",
      "prefer-const": "off",
      "no-duplicate-imports": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "block-scoped-var": "error",
      "no-array-constructor": "off",
      "one-var-declaration-per-line": ["error", "always"],
      "one-var": ["error", "never"],
      "no-multi-spaces": "error",
      "no-loss-of-precision": "off",
      "no-lonely-if": "error",
      "space-before-function-paren": ["error", "never"],
      "space-in-parens": ["error", "never"],
      "no-inner-declarations": ["error", "both"],
      "no-case-declarations": "error",
      "no-empty-function": "error",
      "func-names": ["error", "always"],
      "no-return-assign": "error",
      "no-alert": "error",
      "no-redeclare": "error",
      "no-trailing-spaces": "error",
      "padding-line-between-statements": [
        "error",
        {
          "blankLine": "never",
          "prev": ["return"],
          "next": "*"
        },
        {
          "blankLine": "always",
          "prev": "*",
          "next": ["for"]
        },
        {
          "blankLine": "always",
          "prev": ["for"],
          "next": "*"
        },
        {
          "blankLine": "always",
          "prev": "*",
          "next": ["if"]
        },
        {
          "blankLine": "always",
          "prev": ["if"],
          "next": "*"
        }
      ],
      "max-len": ["error", {
        "code": 120,
        "ignoreTemplateLiterals": true,
        "ignoreComments": true
      }],
      "object-curly-newline": ["error", {
        "ObjectExpression": {
          "multiline": true,
          "minProperties": 2,
          "consistent": true
        },
        "ImportDeclaration": {
          "multiline": true,
          "consistent": true
        },
        "ExportDeclaration": {
          "multiline": true,
          "minProperties": 2,
          "consistent": true
        }
      }],
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "keyword-spacing": ["error", { "after": true }],
      "space-before-blocks": "error",
      "function-call-argument-newline": ["error", "consistent"],
      "func-call-spacing": ["error", "never"],
      "space-infix-ops": "error"
    }
  }
);