import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          environment: "jsdom",
          name: "unit",
          include: ["src/**/*.test.{js,ts}"],
          setupFiles: ["./setup-test-env.js"],
        },
      },
    ],
  },
});