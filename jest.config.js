/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  collectCoverage: true,
  collectCoverageFrom: ["source/**/*.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "json", "text"],
  moduleDirectories: ["node_modules"],
  preset: "ts-jest",
  setupFiles: [],
  setupFilesAfterEnv: ["./jest.setup.js"],
  testEnvironment: "node",
};
