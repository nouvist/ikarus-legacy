import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import { Tool, ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";

export default function registerNavigationTools(
  registrar: ToolRegistrar,
  browser: BrowserController
) {
  registrar.register("getUrl", new GetUrlTool(browser));
  registrar.register("goToUrl", new GoToUrlTool(browser));
  registrar.register("goBack", new GoBackTool(browser));
  registrar.register("goForward", new GoForwardTool(browser));
}

export class GoBackTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Navigate the browser back to the previous page";
  protected _parameters = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    await this._browser.managed.js(() => {
      window.history.back();
    });
    return "Navigated back to the previous page";
  }
}

export class GoForwardTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Navigate the browser forward to the next page";
  protected _parameters = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    await this._browser.managed.js(() => {
      window.history.forward();
    });
    return "Navigated forward to the next page";
  }
}

export class GetUrlTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Get the current URL of the browser";
  protected _parameters = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    const url = await this._browser.managed.js(() => location.href);
    return "The current URL is: " + url;
  }
}

export class GoToUrlTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Navigate the browser to a specified URL";
  protected _parameters = z.object({
    url: z.string().describe("The URL to navigate to"),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute(args: z.infer<typeof this._parameters>) {
    await this._browser.managed.js(({ url }) => {
      location.href = url;
    }, args);
    return `Navigated to ${args.url}`;
  }
}
