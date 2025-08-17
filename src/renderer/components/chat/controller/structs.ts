import {
  AssistantContent,
  AssistantModelMessage,
  JSONValue,
  ModelMessage,
  SystemModelMessage,
  ToolCallPart,
  ToolContent,
  ToolModelMessage,
  ToolSet,
  TypedToolResult,
  UserModelMessage,
} from "ai";
import { BehaviorSubject } from "rxjs";
import { Rxjs } from "~/shared/rxjs";

// TODO: pake yg keekspos harusnya jir
type ProviderOptions = Record<string, Record<string, JSONValue>>;

export interface MessageOptions {
  provider?: ProviderOptions;
  visible?: boolean;
}

export interface StreamMessageOptions extends MessageOptions {
  completed?: boolean;
}

export type Message<TS extends ToolSet = any> =
  | AssistantMessage
  | SystemMessage
  | ToolMessage<TS>
  | UserMessage;

export enum MessageRole {
  Assistant = "assistant",
  System = "system",
  Tool = "tool",
  User = "user",
}

interface SharedMessageTrait {
  toModel(): ModelMessage;
}

export function convertMessageToModel(messages: Message[]) {
  return messages.map((it) => it.toModel());
}

export class AssistantMessage
  implements AssistantModelMessage, SharedMessageTrait
{
  readonly role = MessageRole.Assistant as const;
  readonly providerOptions?: ProviderOptions;
  readonly subject = new BehaviorSubject<AssistantContent>("");
  visible: boolean;

  constructor(content?: AssistantContent, options?: StreamMessageOptions) {
    this.providerOptions = options?.provider;
    this.visible = options?.visible ?? true;
    this.next = this.next.bind(this);
    this.concat = this.concat.bind(this);
    this.complete = this.complete.bind(this);
    this.waitUntilComplete = this.waitUntilComplete.bind(this);
    this.toModel = this.toModel.bind(this);
    if (content) this.next(content);
    if (options?.completed) this.complete();
  }

  toModel(): AssistantModelMessage {
    return {
      role: this.role,
      content: this.content,
      providerOptions: this.providerOptions,
    };
  }

  static isEmpty(content: AssistantContent): content is never {
    return (
      (Array.isArray(content) && content.length === 0) ||
      (typeof content === "string" && content.length === 0)
    );
  }

  static isText(content: AssistantContent): content is string {
    return typeof content === "string";
  }

  static isToolCall(content: AssistantContent): content is ToolCallPart[] {
    return (
      Array.isArray(content) &&
      content.length > 0 &&
      content[0].type === "tool-call"
    );
  }

  get content() {
    return this.subject.value;
  }

  get isCompleted() {
    return this.subject.closed;
  }

  complete() {
    this.subject.complete();
  }

  waitUntilComplete() {
    return Rxjs.waitUntilComplete(this.subject);
  }

  next(content: AssistantContent) {
    this.subject.next(content);
  }

  concat(content: string) {
    if (typeof content === "undefined") return;
    if (typeof this.content !== "string") {
      throw new Error("Cannot concat to non-string content");
    }

    if (content.length === 0) return;
    this.subject.next(this.content + content);
  }
}

export class SystemMessage implements SystemModelMessage, SharedMessageTrait {
  readonly role = MessageRole.System as const;
  readonly content: string;
  readonly providerOptions?: ProviderOptions;
  visible: boolean;

  constructor(content: string, options?: MessageOptions) {
    this.visible = options?.visible ?? true;
    this.content = content;
    this.providerOptions = options?.provider;
    this.toModel = this.toModel.bind(this);
  }

  toModel(): SystemModelMessage {
    return {
      role: this.role,
      content: this.content,
      providerOptions: this.providerOptions,
    };
  }
}

export class ToolMessage<TS extends ToolSet>
  implements ToolModelMessage, SharedMessageTrait
{
  readonly role = MessageRole.Tool as const;
  readonly content: ToolContent;
  readonly providerOptions?: ProviderOptions;
  visible: boolean;

  protected _convert(content: TypedToolResult<TS>[]): ToolContent {
    return content.map((it) => ({
      type: "tool-result",
      toolName: it.toolName,
      toolCallId: it.toolCallId,
      output: { type: "text", value: String(it.output) },
      providerOptions: this.providerOptions,
    }));
  }

  constructor(content: TypedToolResult<TS>[], options?: MessageOptions) {
    this.visible = options?.visible ?? true;
    this.content = this._convert(content);
    this.providerOptions = options?.provider;
    this.push = this.push.bind(this);
    this.toModel = this.toModel.bind(this);
  }

  push(content: TypedToolResult<TS>) {
    this.content.push(...this._convert([content]));
  }

  toModel(): ToolModelMessage {
    return {
      role: this.role,
      content: this.content,
      providerOptions: this.providerOptions,
    };
  }
}

export class UserMessage implements UserModelMessage, SharedMessageTrait {
  readonly role = MessageRole.User as const;
  readonly content: string;
  readonly providerOptions?: ProviderOptions;
  visible: boolean;

  constructor(content: string, options?: MessageOptions) {
    this.visible = options?.visible ?? true;
    this.content = content;
    this.providerOptions = options?.provider;
    this.toModel = this.toModel.bind(this);
  }

  toModel(): UserModelMessage {
    return {
      role: this.role,
      content: this.content,
      providerOptions: this.providerOptions,
    };
  }
}
