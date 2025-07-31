import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { RefCell } from "~/shared/core";

export default function registerHtmlTools(
  registrar: ToolRegistrar,
  browser: RefCell<BrowserController>
) {
  registrar.register("Html.getAllRawHtml", new GetAllHtmlTool(browser));
}

export class GetAllHtmlTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _description = "Get the entire HTML content of the current page";
  protected _parameters = z.object({});

  constructor(browser: RefCell<BrowserController>) {
    super();
    this._browser = browser;
  }

  async execute() {
    const dom = await this._browser.value.dom();
    return dom.documentElement.outerHTML;
  }
}
