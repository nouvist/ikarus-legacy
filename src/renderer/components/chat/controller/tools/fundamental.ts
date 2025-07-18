import { jsonSchema, tool, ToolExecutionOptions } from "ai";
import z from "zod";

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
