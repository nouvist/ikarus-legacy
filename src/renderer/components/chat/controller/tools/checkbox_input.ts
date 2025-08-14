import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  ManagedTool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";

export type CheckboxInputTools = ReturnType<typeof createCheckboxInputTools>;
export default function createCheckboxInputTools(
  browser: BrowserController,
  fetcher: Fetcher
) {
  return {
    "CheckboxInput.findBySemantics": new FindBySemanticsTool(
      browser,
      fetcher
    ).toTool(),
    "CheckboxInput.findByName": new FindByNameTool(browser, fetcher).toTool(),

    "CheckboxInput.checkByValue": new CheckByValueTool(
      browser,
      fetcher
    ).toTool(),
    "CheckboxInput.uncheckByValue": new UncheckByValueTool(
      browser,
      fetcher
    ).toTool(),
    "CheckboxInput.toggleByValue": new ToggleByValueTool(
      browser,
      fetcher
    ).toTool(),

    "CheckboxInput.checkBySelector": new CheckBySelectorTool(browser).toTool(),
    "CheckboxInput.uncheckBySelector": new UncheckBySelectorTool(
      browser
    ).toTool(),
    "CheckboxInput.toggleBySelector": new ToggleBySelectorTool(
      browser
    ).toTool(),
  } as const;
}

export class FindBySemanticsTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Get checkbox input field information from the page.";
  input = z.object({
    semantics: z
      .string()
      .describe("Description of the checkbox input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this.input>) {
    semantics = semantics.trim();
    const result =
      await this._fetcher.checkbox.findElementsBySemantics(semantics);
    const dom = await this._browser.dom();

    if (result.length === 0) return "No checkbox inputs found.";
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
  description = "Get checkbox input field information by name.";
  input = z.object({
    name: z.string().describe("Name of the checkbox input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name }: z.infer<typeof this.input>) {
    const result = await this._fetcher.checkbox.findElementsByName(name);
    const dom = await this._browser.dom();

    if (result.length === 0) return "No checkbox inputs found.";
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

export class CheckByValueTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Check a checkbox input by value.";
  input = z.object({
    name: z.string().describe("Name of the checkbox input to check."),
    value: z.string().describe("Value of the checkbox input to check."),
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
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    if (input.checked) return "Checkbox input is already checked.";
    input.click();
    return "Checkbox input checked successfully.";
  }
}

export class UncheckByValueTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Uncheck a checkbox input by value.";
  input = z.object({
    name: z.string().describe("Name of the checkbox input to uncheck."),
    value: z.string().describe("Value of the checkbox input to uncheck."),
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
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    if (!input.checked) return "Checkbox input is already unchecked.";
    input.click();
    return "Checkbox input unchecked successfully.";
  }
}

export class ToggleByValueTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Toggle a checkbox input by value.";
  input = z.object({
    name: z.string().describe("Name of the checkbox input to toggle."),
    value: z.string().describe("Value of the checkbox input to toggle."),
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
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    input.click();
    return "Checkbox input toggled successfully.";
  }
}

export class CheckBySelectorTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Check a checkbox input by its selector.";
  input = z.object({
    selector: z.string().describe("Selector of the checkbox input to check."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this.input>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    if (input.checked) return "Checkbox input is already checked.";
    input.click();
    return "Checkbox input checked successfully.";
  }
}

export class UncheckBySelectorTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Uncheck a checkbox input by its selector.";
  input = z.object({
    selector: z.string().describe("Selector of the checkbox input to uncheck."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this.input>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    if (!input.checked) return "Checkbox input is already unchecked.";
    input.click();
    return "Checkbox input unchecked successfully.";
  }
}

export class ToggleBySelectorTool extends ManagedTool {
  protected _browser: BrowserController;
  description = "Toggle a checkbox input by its selector.";
  input = z.object({
    selector: z.string().describe("Selector of the checkbox input to toggle."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this.input>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    input.click();
    return "Checkbox input toggled successfully.";
  }
}
