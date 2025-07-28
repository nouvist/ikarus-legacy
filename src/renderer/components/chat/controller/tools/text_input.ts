import z from "zod";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { inline, RefCell } from "~/shared/core";

export default function registerTextInputTools(
  registrar: ToolRegistrar,
  browser: RefCell<BrowserController>,
  fetcher: Fetcher
) {
  registrar.register(
    "TextInput.findBySemantics",
    new FindTextInputTool(browser, fetcher)
  );
  registrar.register(
    "TextInput.changeBySelector",
    new ChangeTextInputTool(browser)
  );
}

export class FindTextInputTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _fetcher: Fetcher;
  protected _description = "Get input field information from the page.";
  protected _parameters = z.object({
    semantics: z.string().describe("Description of the input to find."),
  });

  constructor(browser: RefCell<BrowserController>, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.value.managed.dom();
    await this._fetcher.fetchTextInputs();

    semantics = semantics.trim().toLowerCase();
    const inputs = await this._fetcher.findTextInput(semantics);
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

export class ChangeTextInputTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _description = inline(`
    Change the value of an input field on the page, given its selector. Use
    findInput if you don't know the selector.
  `);
  protected _parameters = z.object({
    selector: z.string().describe("The selector of the input field to change"),
    value: z.string().describe("The new value to set in the input field"),
  });

  constructor(browser: RefCell<BrowserController>) {
    super();
    this._browser = browser;
  }

  execute({ selector, value }: z.infer<typeof this._parameters>) {
    return this._browser.value.managed.js(
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
