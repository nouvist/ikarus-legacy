import { jsonSchema, tool, ToolExecutionOptions } from "ai";
import z from "zod";
import { BrowserController } from "~/renderer/components/browser";

export abstract class Tool {
  protected abstract _description: string;
  protected abstract _parameters: z.ZodTypeAny;

  constructor() {
    this.toTool = this.toTool.bind(this);
  }

  toTool() {
    return tool({
      description: this._description,
      parameters: jsonSchema(z.toJSONSchema(this._parameters)),
      execute: this.execute.bind(this),
    });
  }

  abstract execute(
    args: z.infer<typeof this._parameters>,
    opts: ToolExecutionOptions
  ): Promise<any>;
}

export class ToolRegistrar {
  private _tools: Record<string, ReturnType<Tool["toTool"]>> = {};

  constructor() {
    this.register = this.register.bind(this);
    this.finalize = this.finalize.bind(this);
  }

  register(name: string, tool: Tool) {
    this._tools[name] = tool.toTool();
  }

  finalize() {
    return this._tools;
  }
}

export default function createTools(browser: BrowserController) {
  const registrar = new ToolRegistrar();
  registrar.register("getUrl", new GetUrlTool(browser));
  registrar.register("goToUrl", new GoToUrlTool(browser));

  return registrar.finalize();
}

export class GetUrlTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Get the current URL of the browser";
  protected _parameters = z.object({});

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute() {
    const url = await this._browser.managed.js(() => location.href);
    return "The current URL is: " + url;
  }
}

export class GoToUrlTool extends Tool {
  protected _browser: BrowserController;
  protected _description = "Navigate the browser to a specified URL";
  protected _parameters = z.object({
    url: z.string().describe("The URL to navigate to"),
  });

  constructor(browser: BrowserController) {
    super();
    this._browser = browser;
  }

  async execute(args: z.infer<typeof this._parameters>) {
    await this._browser.managed.js(({ url }) => {
      location.href = url;
    }, args);
    return `Navigated to ${args.url}`;
  }
}
