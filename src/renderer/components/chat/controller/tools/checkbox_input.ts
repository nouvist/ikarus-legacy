import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";

export default function registerCheckboxInputTools(
  registrar: ToolRegistrar,
  browser: BrowserController,
  fetcher: Fetcher
) {
  registrar.register(
    "CheckboxInput.findBySemantics",
    new FindBySemanticsTool(browser, fetcher)
  );
  registrar.register(
    "CheckboxInput.findByName",
    new FindByNameTool(browser, fetcher)
  );

  registrar.register(
    "CheckboxInput.checkByValue",
    new CheckByValueTool(browser, fetcher)
  );
  registrar.register(
    "CheckboxInput.uncheckByValue",
    new UncheckByValueTool(browser, fetcher)
  );
  registrar.register(
    "CheckboxInput.toggleByValue",
    new ToggleByValueTool(browser, fetcher)
  );

  registrar.register(
    "CheckboxInput.checkBySelector",
    new CheckBySelectorTool(browser)
  );
  registrar.register(
    "CheckboxInput.uncheckBySelector",
    new UncheckBySelectorTool(browser)
  );
  registrar.register(
    "CheckboxInput.toggleBySelector",
    new ToggleBySelectorTool(browser)
  );
}

export class FindBySemanticsTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description =
    "Get checkbox input field information from the page.";
  protected _parameters = z.object({
    semantics: z
      .string()
      .describe("Description of the checkbox input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this._parameters>) {
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

export class FindByNameTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Get checkbox input field information by name.";
  protected _parameters = z.object({
    name: z.string().describe("Name of the checkbox input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name }: z.infer<typeof this._parameters>) {
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

export class CheckByValueTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Check a checkbox input by value.";
  protected _parameters = z.object({
    name: z.string().describe("Name of the checkbox input to check."),
    value: z.string().describe("Value of the checkbox input to check."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name, value }: z.infer<typeof this._parameters>) {
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

export class UncheckByValueTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Uncheck a checkbox input by value.";
  protected _parameters = z.object({
    name: z.string().describe("Name of the checkbox input to uncheck."),
    value: z.string().describe("Value of the checkbox input to uncheck."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name, value }: z.infer<typeof this._parameters>) {
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

export class ToggleByValueTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Toggle a checkbox input by value.";
  protected _parameters = z.object({
    name: z.string().describe("Name of the checkbox input to toggle."),
    value: z.string().describe("Value of the checkbox input to toggle."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ name, value }: z.infer<typeof this._parameters>) {
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

export class CheckBySelectorTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Check a checkbox input by its selector.";
  protected _parameters = z.object({
    selector: z.string().describe("Selector of the checkbox input to check."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    if (input.checked) return "Checkbox input is already checked.";
    input.click();
    return "Checkbox input checked successfully.";
  }
}

export class UncheckBySelectorTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Uncheck a checkbox input by its selector.";
  protected _parameters = z.object({
    selector: z.string().describe("Selector of the checkbox input to uncheck."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    if (!input.checked) return "Checkbox input is already unchecked.";
    input.click();
    return "Checkbox input unchecked successfully.";
  }
}

export class ToggleBySelectorTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Toggle a checkbox input by its selector.";
  protected _parameters = z.object({
    selector: z.string().describe("Selector of the checkbox input to toggle."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ selector }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.dom();
    const input = dom.querySelector<HTMLInputElement>(selector);
    if (!input) return "Checkbox input not found.";
    if (input.type !== "checkbox") return "Element is not a checkbox input.";
    input.click();
    return "Checkbox input toggled successfully.";
  }
}
