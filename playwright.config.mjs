const config = { testDir: "./tests/e2e", use: { trace: "retain-on-failure", screenshot: "only-on-failure" }, webServer: { command: "npm run dev", url: "http://127.0.0.1:3000", reuseExistingServer: true } };
export default config;
