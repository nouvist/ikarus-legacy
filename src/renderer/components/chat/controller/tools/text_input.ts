import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  ManagedTool
} from "~/renderer/components/chat/controller/tools/fundamental";
import { inline } from "~/shared/core";

export type TextInputTools = ReturnType<typeof createTextInputTools>;
export default function createTextInputTools(
  browser: BrowserController,
  fetcher: Fetcher
) {
  return {
    "TextInput.findBySemantics": new FindBySemanticsTool(
      browser,
      fetcher
    ).toTool(),
    "TextInput.changeBySelector": new ChangeBySelectorTool(browser).toTool(),
    "TextInput.submitBySelector": new SubmitBySelectorTool(
      browser,
      fetcher
    ).toTool(),
  } as const;
}

export class FindBySemanticsTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = "Get input field information from the page.";
  input = z.object({
    semantics: z.string().describe("Description of the input to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this.input>) {
    const dom = await this._browser.dom();
    await this._fetcher.text.fetchTextInputs();

    semantics = semantics.trim().toLowerCase();
    const inputs = await this._fetcher.text.findTextInput(semantics);
    const lines = inputs.map((input) =>
      [
        `Tag: ${input.tag}`,
        `Type: ${input.type || "N/A"}`,
        `ID: ${input.id || "N/A"}`,
        `Name: ${input.name || "N/A"}`,
        `Label: ${input.label || "N/A"}`,
        `Placeholder: ${input.placeholder}`,
        `Selector: ${input.selector}`,
        `Value: ${dom.querySelector<HTMLInputElement>(input.selector)?.value || ""}`,
      ].join("\n")
    );

    lines.push(`Found ${lines.length} elements matching "${semantics}"`);
    return lines.join("\n\n");
  }
}

export class ChangeBySelectorTool extends ManagedTool {
  protected _browser: BrowserController;
  description = inline(`
    Change the value of an input field on the page, given its selector. Use
    findInput if you don't know the selector.
  `);
  input = z.object({
    selector: z.string().describe("The selector of the input field to change."),
    value: z.string().describe("The new value to set in the input field."),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  execute({ selector, value }: z.infer<typeof this.input>) {
    return this._browser.js(
      ({ selector, value }) => {
        const element = document.querySelector(selector);

        if (!element) return "Error: Element not found";

        if (
          !(
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement
          )
        ) {
          return "Error: Element is not an input or textarea";
        }

        try {
          element.value = value;
          return `Changed value to "${value}"`;
        } catch (error) {
          return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
      { selector, value }
    );
  }
}

export class SubmitBySelectorTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  description = inline(`
    Emulate pressing the Enter key on an input field, given its selector.
  `);
  input = z.object({
    selector: z.string().describe("The selector of the input field to submit."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  execute({ selector }: z.infer<typeof this.input>) {
    return this._browser.js((selector) => {
      const input = document.querySelector(selector);
      if (!input) return "Error: Element not found";
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        code: "Enter",
        which: 13,
        keyCode: 13,
      });
      input.dispatchEvent(event);
      return "Enter key pressed on the specified input.";
    }, selector);
  }
}
