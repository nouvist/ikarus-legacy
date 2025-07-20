import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { getSelector } from "~/shared/html";

export default function registerButtonTools(
  registrar: ToolRegistrar,
  browser: BrowserController
) {
  registrar.register("findButton", new FindButtonTool(browser));
  registrar.register("clickButton", new ClickBottonTool(browser));
}

export class FindButtonTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Get button or anchor information from the page";
  protected _parameters = z.object({
    text: z.string().describe("The text of the button to get"),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ text }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.managed.dom();

    text = text.trim().toLowerCase();
    const lines = Array.from(dom.querySelectorAll("button, a, input[type=submit]"))
      .filter((el) => el.textContent?.toLowerCase().includes(text))
      .map((el, index) =>
        [
          `Element ${index + 1}:`,
          `type: ${el.tagName.toLowerCase()}`,
          `text: ${JSON.stringify(el.textContent?.trim() || "")}`,
          `selector: ${getSelector(el)}`,
        ].join("\n")
      );

    lines.push(`Found ${lines.length} elements matching "${text}"`);
    return lines.join("\n\n");
  }
}

export class ClickBottonTool extends Tool {
  protected _browser: BrowserController;
  protected _description =
    "Click a button or anchor on the page, given its selector (use findButton if you don't know the selector)";
  protected _parameters = z.object({
    selector: z.string().describe("The selector of the button to click"),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.managed.dom();
    const element = dom.querySelector<HTMLButtonElement>(selector);

    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    element.click();
    return `Clicked element with selector: ${selector}`;
  }
}
