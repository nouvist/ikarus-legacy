import { Tool, tool, ToolCallOptions, zodSchema } from "ai";
import z from "zod";

export type ManagedToolInputInfer<T extends ManagedTool> = z.infer<T["input"]>;
export type ManagedToolInfer<T extends ManagedTool> = Tool<
  ManagedToolInputInfer<T>
>;

export abstract class ManagedTool {
  abstract description: string;
  abstract input: z.ZodObject;

  constructor() {
    this.toTool = this.toTool.bind(this);
    this._execute = this._execute.bind(this);
    this.execute = this.execute.bind(this);
  }

  toTool() {
    return tool({
      description: this.description,
      inputSchema: zodSchema(this.input),
      execute: this._execute,
    }) as ManagedToolInfer<this>;
  }

  protected _execute(
    args: z.infer<typeof this.input>,
    opts: ToolCallOptions
  ): Promise<any> {
    return this.execute(args, opts);
  }

  abstract execute(
    args: z.infer<typeof this.input>,
    opts: ToolCallOptions
  ): Promise<any>;
}
