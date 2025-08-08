import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { inline } from "~/shared/core";

export default function registerSelectTools(
  registrar: ToolRegistrar,
  browser: BrowserController,
  fetcher: Fetcher
) {
  registrar.register(
    "Select.findBySemantics",
    new FindSelectBySemanticsTool(browser, fetcher)
  );
  registrar.register(
    "Select.selectByValue",
    new SelectByValueTool(browser)
  );
}

export class FindSelectBySemanticsTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;

  protected _description = "Get select (dropdown) information from the page.";
  protected _parameters = z.object({
    semantics: z.string().describe("Description of the select to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this._parameters>) {
    await this._fetcher.select.fetch();

    semantics = semantics.trim().toLowerCase();
    const selects =
      await this._fetcher.select.findElementsBySemantics(semantics);
    const lines = selects.map((select) =>
      [
        `- Selector: ${select.selector}`,
        "  Labels:",
        ...Array.from(select.labels).map((label) => `    - ${label}`),
        "  Options:",
        ...select.options.flatMap((option) => [
          `    - Text: ${option.text}`,
          `      Value: ${option.value}`,
        ]),
      ].join("\n")
    );

    lines.unshift(
      `Found ${selects.length} selects with nearest semantics search`
    );
    return lines.join("\n\n");
  }
}

export class SelectByValueTool extends Tool {
  protected _browser: BrowserController;
  protected _description = inline(`
    Select an option from a dropdown (select) element on the page, given its
    selector and the value to select. Use Select.findBySemantics if you don't
    know the selector.
  `);
  protected _parameters = z.object({
    selector: z.string().describe("The selector of the select element."),
    value: z.string().describe("The value of the option to select."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector, value }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.dom();
    const select = dom.querySelector<HTMLSelectElement>(selector);
    if (!select) return "Select element not found.";

    const option = Array.from(select.options).find(
      (opt) => opt.value === value
    );
    if (!option) return `Option with value "${value}" not found.`;
    select.value = value;
    const event = new Event("change", { bubbles: true });
    select.dispatchEvent(event);
    return `Successfully select the specified option.`;
  }
}
