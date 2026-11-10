export default {
  testEnvironment: "node",
  transform: {},
  clearMocks: true,
  restoreMocks: true,

  testMatch: [
    "**/test/**/*.test.js",
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
  ],
};
