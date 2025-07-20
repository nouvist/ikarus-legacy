import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { getSelector } from "~/shared/html";

export default function registerInputTools(
  registrar: ToolRegistrar,
  browser: BrowserController
) {
  registrar.register("findInput", new FindInputTool(browser));
  registrar.register("changeInput", new ChangeInputTool(browser));
}

export class FindInputTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Get input field information from the page";
  protected _parameters = z.object({
    text: z.string().describe("The text of the input field to get"),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute({ text }: z.infer<typeof this._parameters>) {
    const dom = await this._browser.managed.dom();

    text = text.trim().toLowerCase();
    const lines = Array.from(
      dom.querySelectorAll<HTMLInputElement>("input, textarea")
    )
      .filter(
        (el) =>
          el.placeholder?.toLowerCase().includes(text) ||
          el.name?.toLowerCase().includes(text) ||
          el.id?.toLowerCase().includes(text) ||
          el.className.toLowerCase().replace(/[\-_]/g, " ").includes(text)
      )
      .map((el, index) =>
        [
          `Element ${index + 1}:`,
          `type: ${el.tagName.toLowerCase()}`,
          `placeholder: ${JSON.stringify(el.placeholder?.trim() || "")}`,
          `selector: ${getSelector(el)}`,
        ].join("\n")
      );

    lines.push(`Found ${lines.length} elements matching "${text}"`);
    return lines.join("\n\n");
  }
}

export class ChangeInputTool extends Tool {
  protected _browser: BrowserController;
  protected _description =
    "Change the value of an input field on the page, given its selector (use findInput if you don't know the selector)";
  protected _parameters = z.object({
    selector: z.string().describe("The selector of the input field to change"),
    value: z.string().describe("The new value to set in the input field"),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  execute({ selector, value }: z.infer<typeof this._parameters>) {
    return this._browser.managed.js(
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
