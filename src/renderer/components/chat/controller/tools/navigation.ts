import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import {
  ManagedTool
} from "~/renderer/components/chat/controller/tools/fundamental";

export type NavigationTools = ReturnType<typeof createNavigationTools>;
export default function createNavigationTools(browser: BrowserController) {
  return {
    "Navigation.getUrl": new GetUrlTool(browser).toTool(),
    "Navigation.getTitle": new GetTitleTool(browser).toTool(),
    "Navigation.goToUrl": new GoToUrlTool(browser).toTool(),
    "Navigation.goBack": new GoBackTool(browser).toTool(),
    "Navigation.goForward": new GoForwardTool(browser).toTool(),
  } as const;
}

export class GetUrlTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Get the current URL of the browser.";
  input = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    const url = this._browser.url();
    return [
      "The current URL is: " + url,
      "Use `Html` tools to get the web content.",
    ].join("\n");
  }
}

export class GetTitleTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Get the current title of the browser.";
  input = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    const title = await this._browser.title();
    return "The current title is: " + title;
  }
}

export class GoToUrlTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Navigate the browser to a specified URL.";
  input = z.object({
    url: z
      .string()
      .describe("The URL to navigate to with its protocol (e.g. https://*)."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ url }: z.infer<typeof this.input>) {
    await this._browser.go(url);
    return [
      `Navigated to ${url}`,
      "Use `Html` tools to read the web content.",
      "Use `Input` tools to interact with text inputs and text area.",
      "Use `Button` tools to interact with buttons and links.",
    ].join("\n");
  }
}

export class GoBackTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Navigate the browser back to the previous page.";
  input = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    if (!this._browser.canGoBack()) {
      return "Cannot go back, no previous page available.";
    }

    await this._browser.goBack();
    return [
      "Navigated back to the previous page.",
      "Use `Html` tools to read the web content.",
      "Use `Input` tools to interact with text inputs and text area.",
      "Use `Button` tools to interact with buttons and links.",
    ].join("\n");
  }
}

export class GoForwardTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Navigate the browser forward to the next page.";
  input = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    if (!this._browser.canGoForward()) {
      return "Cannot go forward, no next page available.";
    }

    await this._browser.goForward();
    return [
      "Navigated forward to the next page.",
      "Use `Html` tools to read the web content.",
      "Use `Input` tools to interact with text inputs and text area.",
      "Use `Button` tools to interact with buttons and links.",
    ].join("\n");
  }
}
