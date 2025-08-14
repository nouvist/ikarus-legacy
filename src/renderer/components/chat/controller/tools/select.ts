import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  ManagedTool
} from "~/renderer/components/chat/controller/tools/fundamental";
import { inline } from "~/shared/core";

export type SelectTools = ReturnType<typeof createSelectTools>;
export default function createSelectTools(
  browser: BrowserController,
  fetcher: Fetcher
) {
  return {
    "Select.findBySemantics": new FindSelectBySemanticsTool(
      browser,
      fetcher
    ).toTool(),
    "Select.selectByValue": new SelectByValueTool(browser).toTool(),
  } as const;
}

export class FindSelectBySemanticsTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;

  description = "Get select (dropdown) information from the page.";
  input = z.object({
    semantics: z.string().describe("Description of the select to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this.input>) {
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

export class SelectByValueTool extends ManagedTool {
  protected _browser: BrowserController;
  description = inline(`
    Select an option from a dropdown (select) element on the page, given its
    selector and the value to select. Use Select.findBySemantics if you don't
    know the selector.
  `);
  input = z.object({
    selector: z.string().describe("The selector of the select element."),
    value: z.string().describe("The value of the option to select."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector, value }: z.infer<typeof this.input>) {
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
