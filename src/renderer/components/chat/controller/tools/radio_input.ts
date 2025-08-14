import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  ManagedTool
} from "~/renderer/components/chat/controller/tools/fundamental";

export type RadioInputTools = ReturnType<typeof createRadioInputTools>;
export default function createRadioInputTools(
  browser: BrowserController,
  fetcher: Fetcher
) {
  return {
    "RadioInput.findBySemantics": new FindBySemanticsTool(
      browser,
      fetcher
    ).toTool(),
    "RadioInput.findByName": new FindByNameTool(browser, fetcher).toTool(),
    "RadioInput.changeByValue": new ChangeByValueTool(
      browser,
      fetcher
    ).toTool(),
    "RadioInput.changeBySelector": new ChangeBySelectorTool(browser).toTool(),
  } as const;
}

export class FindBySemanticsTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Get radio input field information from the page.";
  input = z.object({
    semantics: z.string().describe("Description of the radio input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this.input>) {
    semantics = semantics.trim();
    const result = await this._fetcher.radio.findElementsBySemantics(semantics);
    const dom = await this._browser.dom();

    if (result.length === 0) return "No radio inputs found.";
    const lines = result.map((input) => {
      const element = dom.querySelector<HTMLInputElement>(input.selector);
      const checked = element?.checked ? "checked" : "unchecked";
      return [
        `- Selector: ${input.selector}`,
        `  Value: ${input.value}`,
        `  Name: ${input.name}`,
        `  Text: ${input.text}`,
        `  Status: ${checked}`,
        "  Labels:",
        ...Array.from(input.labels).map((label) => `  - ${label}`),
      ].join("\n");
    });

    return lines.join("\n");
  }
}

export class FindByNameTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Get radio input field information by name.";
  input = z.object({
    name: z.string().describe("Name of the radio input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name }: z.infer<typeof this.input>) {
    const result = await this._fetcher.radio.findElementsByName(name);
    const dom = await this._browser.dom();

    if (result.length === 0) return "No radio inputs found.";
    const lines = result.map((input) => {
      const element = dom.querySelector<HTMLInputElement>(input.selector);
      const checked = element?.checked ? "checked" : "unchecked";
      return [
        `- Selector: ${input.selector}`,
        `  Value: ${input.value}`,
        `  Name: ${input.name}`,
        `  Text: ${input.text}`,
        `  Status: ${checked}`,
        "  Labels:",
        ...Array.from(input.labels).map((label) => `  - ${label}`),
      ].join("\n");
    });

    return lines.join("\n");
  }
}

export class ChangeByValueTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Change radio input by value.";
  input = z.object({
    name: z.string().describe("Name of the radio input to change."),
    value: z.string().describe("Value of the radio input to change."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name, value }: z.infer<typeof this.input>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(
      `input[name="${CSS.escape(name)}"][value="${CSS.escape(value)}"]`
    );
    if (!input) return "Radio input not found.";
    if (input.type !== "radio") return "Element is not a radio input.";
    if (input.checked) return "Radio input is already selected.";
    input.click();
    return "Radio input changed successfully.";
  }
}

export class ChangeBySelectorTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Click a radio input by its selector.";
  input = z.object({
    selector: z.string().describe("Selector of the radio input to click."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this.input>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Radio input not found.";
    if (input.type !== "radio") return "Element is not a radio input.";
    if (input.checked) return "Radio input is already selected.";
    input.click();
    return "Radio input clicked successfully.";
  }
}
