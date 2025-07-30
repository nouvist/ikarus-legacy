import { jsonSchema, tool, ToolExecutionOptions } from "ai";
import z from "zod";

export abstract class Tool {
  protected abstract _description: string;
  protected abstract _parameters: z.ZodTypeAny;

  constructor() {
    this._execute = this._execute.bind(this);
    this.validate = this.validate.bind(this);
    this.execute = this.execute.bind(this);
    this.toTool = this.toTool.bind(this);
  }

  toTool() {
    return tool({
      description: this._description,
      parameters: jsonSchema(z.toJSONSchema(this._parameters)),
      execute: this._execute,
    });
  }

  protected _execute(args: unknown, opts: ToolExecutionOptions): Promise<any> {
    try {
      const parsed = this.validate(args);
      return this.execute(parsed, opts);
    } catch (error) {
      if (!(error instanceof Error)) {
        return Promise.resolve("Error: An unknown error occurred");
      }
      return Promise.resolve("Error: " + error.message);
    }
  }

  validate(args: unknown): asserts args is z.infer<typeof this._parameters> {
    const parsed = this._parameters.parse(args);
    if (parsed === undefined) throw new Error("Invalid arguments");
    return parsed as any;
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
