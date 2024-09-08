const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  // General settings for all files
  {
    ignores: ["node_modules/**"]
  },
  // TypeScript specific settings
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json", // Adjust this path if your tsconfig.json is located elsewhere
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Example of adding a rule to avoid using 'any'
      "@typescript-eslint/consistent-type-imports": "error", // Ensures consistent use of type imports
      "@typescript-eslint/no-empty-function": "warn", // Warns against empty functions
      // "no-console": ["warn", { allow: ["warn", "error"] }], // Allow specific console methods
      "no-console": "off",
      "comma-dangle": ["error", "never"] // Disallow trailing commas
    }
  },
  // JavaScript specific settings
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error" // Suggest using const if a variable is not reassigned
    }
  }
];
