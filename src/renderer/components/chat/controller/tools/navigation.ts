import z from "zod";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { RefCell } from "~/shared/core";

export default function registerNavigationTools(
  registrar: ToolRegistrar,
  browser: RefCell<BrowserController>
) {
  registrar.register("Navigation.getUrl", new GetUrlTool(browser));
  registrar.register("Navigation.goToUrl", new GoToUrlTool(browser));
  registrar.register("Navigation.goBack", new GoBackTool(browser));
  registrar.register("Navigation.goForward", new GoForwardTool(browser));
}

export class GoBackTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _description = "Navigate the browser back to the previous page";
  protected _parameters = z.object({});

  constructor(browser: RefCell<BrowserController>) {
    super();
    this._browser = browser;
  }

  async execute() {
    if (!this._browser.value.managed.canGoBack()) {
      return "Cannot go back, no previous page available";
    }

    await this._browser.value.managed.goForward();
    return "Navigated back to the previous page";
  }
}

export class GoForwardTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _description = "Navigate the browser forward to the next page";
  protected _parameters = z.object({});

  constructor(browser: RefCell<BrowserController>) {
    super();
    this._browser = browser;
  }

  async execute() {
    if (!this._browser.value.managed.canGoForward()) {
      return "Cannot go forward, no next page available";
    }

    await this._browser.value.managed.goForward();
    return "Navigated forward to the next page";
  }
}

export class GetUrlTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _description = "Get the current URL of the browser";
  protected _parameters = z.object({});

  constructor(browser: RefCell<BrowserController>) {
    super();
    this._browser = browser;
  }

  async execute() {
    const url = await this._browser.value.managed.js(() => location.href);
    return "The current URL is: " + url;
  }
}

export class GoToUrlTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _description = "Navigate the browser to a specified URL";
  protected _parameters = z.object({
    url: z
      .string()
      .describe("The URL to navigate to with its protocol (e.g. https://*)"),
  });

  constructor(browser: RefCell<BrowserController>) {
    super();
    this._browser = browser;
  }

  async execute({ url }: z.infer<typeof this._parameters>) {
    await this._browser.value.managed.go(url);
    return `Navigated to ${url}`;
  }
}
