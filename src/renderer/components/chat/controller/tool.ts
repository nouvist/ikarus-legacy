import { jsonSchema, tool } from "ai";
import { BrowserController } from "~/renderer/components/browser";

export default function createTools(browser: BrowserController) {
  return { getUrl: createGetUrlTool(browser) };
}

export function createGetUrlTool(browser: BrowserController) {
  return tool({
    description: "Get the current URL of the browser",
    parameters: jsonSchema({
      type: "object",
      properties: {},
      required: [],
    }),
    execute: async () => {
      const url = await browser.managed.js(() => location.href);
      return "The current URL is: " + url;
    },
  });
}
