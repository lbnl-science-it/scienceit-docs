import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The widget tests load chatbot.js, which mounts itself into the DOM on
    // load; the Worker tests only import pure functions and don't care.
    environment: "jsdom",
    include: ["test/**/*.test.js"],
  },
});
