module.exports = {
  coverageDirectory: "./coverage",
  coverageReporters: ["lcov", "html", "text-summary"],
  collectCoverageFrom: ["./src/**/*.js", "./index.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setupFiles/timeout.js"],
};
