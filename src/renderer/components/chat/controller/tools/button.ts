import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { inline } from "~/shared/core";

export default function registerButtonTools(
  registrar: ToolRegistrar,
  browser: BrowserController,
  fetcher: Fetcher
) {
  registrar.register(
    "Button.findBySemantics",
    new FindBySemanticsTool(browser, fetcher)
  );
  registrar.register("Button.clickBySelector", new ClickBottonTool(browser));
}

export class FindBySemanticsTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;

  protected _description = "Get button or anchor information from the page.";
  protected _parameters = z.object({
    semantics: z.string().describe("Description of the button to find."),
  });

  constructor(browser: BrowserController, memory: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = memory;
  }

  async execute({ semantics }: z.infer<typeof this._parameters>) {
    await this._fetcher.fetchButtons();

    semantics = semantics.trim().toLowerCase();
    const buttons = await this._fetcher.findButton(semantics);
    const lines = buttons.map((button) =>
      [
        `Text: ${button.text}`,
        `Type: ${button.tag}`,
        `Selector: ${button.selector}`,
      ].join("\n")
    );

    lines.unshift(
      `Found ${buttons.length} buttons with nearest semantics search`
    );
    return lines.join("\n\n");
  }
}

export class ClickBottonTool extends Tool {
  protected _browser: BrowserController;
  protected _description = inline(`
    Click a button or anchor on the page, given its selector. Use findButton if
    you don't know the selector.
  `);
  protected _parameters = z.object({
    selector: z.string().describe("The selector of the button to click."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.dom();
    const element = dom.querySelector<HTMLButtonElement>(selector);

    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    element.click();
    return `Clicked element with selector: ${selector}`;
  }
}
