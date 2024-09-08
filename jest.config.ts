import type { Config } from "jest";

const config: Config = {
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"], // Pattern for finding test files
  testPathIgnorePatterns: ["/node_modules/"], // Ignore node_modules
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"], // File extensions to test
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest" // Use ts-jest for both JS and TS files
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json" // Use your TypeScript configuration
    }
  },
  moduleDirectories: ["node_modules", "src"], // Allow Jest to find modules in these directories
  preset: "ts-jest" // Add this line to specify ts-jest as the preset
};

export default config;
