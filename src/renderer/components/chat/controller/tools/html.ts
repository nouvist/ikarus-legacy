import z from "zod";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";

export default function registerHtmlTools(
  registrar: ToolRegistrar,
  browser: BrowserController
) {
  registrar.register("Html.getAllRawHtml", new GetAllHtmlTool(browser));
}

export class GetAllHtmlTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Get the entire HTML content of the current page";
  protected _parameters = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    const dom = await this._browser.managed.dom();
    return dom.documentElement.outerHTML;
  }
}
