import { LanguageModelV1ProviderMetadata } from "@ai-sdk/provider";
import {
  AssistantContent,
  CoreAssistantMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  ToolCallPart,
  ToolContent,
  ToolResultPart,
} from "ai";
import { BehaviorSubject } from "rxjs";
import { getRandom } from "~/shared/core";
import { Rxjs } from "~/shared/rxjs";

type ProviderOptions = LanguageModelV1ProviderMetadata;

export interface MessageOptions {
  provider?: ProviderOptions;
  visible?: boolean;
}

export interface StreamMessageOptions extends MessageOptions {
  completed?: boolean;
}

export type Message =
  | AssistantMessage
  | SystemMessage
  | ToolMessage
  | UserMessage;

export enum MessageRole {
  Assistant = "assistant",
  System = "system",
  Tool = "tool",
  User = "user",
}

export abstract class ToolEmulator {
  static emulateToolCall(name: string, args: object) {
    const id = "emulated::" + getRandom();
    return [
      { id, name },
      new AssistantMessage(
        [
          {
            type: "tool-call",
            toolCallId: id,
            toolName: name,
            args: args,
          } satisfies ToolCallPart,
        ],
        { visible: false }
      ),
    ] as const;
  }

  static emulateToolResult(meta: { id: string; name: string }, result: string) {
    return new ToolMessage(
      [
        {
          type: "tool-result",
          toolCallId: meta.id,
          toolName: meta.name,
          result: result,
        } satisfies ToolResultPart,
      ],
      { visible: false }
    );
  }
}

export class AssistantMessage implements CoreAssistantMessage {
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
    if (content) this.next(content);
    if (options?.completed) this.complete();
  }

  static fromCoreMessage(message: CoreAssistantMessage) {
    if (message instanceof AssistantMessage) return message;
    const obj = new AssistantMessage(
      typeof message.content === "string"
        ? message.content
        : message.content.join("").toString(),
      message.providerOptions
    );
    obj.complete();
    return obj;
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
    if (typeof this.content !== "string") {
      throw new Error("Cannot concat to non-string content");
    }
    this.subject.next(this.content + content);
  }
}

export class SystemMessage implements CoreSystemMessage {
  readonly role = MessageRole.System as const;
  readonly content: string;
  readonly providerOptions?: ProviderOptions;
  visible: boolean;

  constructor(content: string, options?: MessageOptions) {
    this.visible = options?.visible ?? true;
    this.content = content;
    this.providerOptions = options?.provider;
  }

  static fromCoreMessage(message: CoreSystemMessage) {
    if (message instanceof SystemMessage) return message;
    return new SystemMessage(message.content, message.providerOptions);
  }
}

export class ToolMessage implements CoreToolMessage {
  readonly role = MessageRole.Tool as const;
  readonly content: ToolContent;
  readonly providerOptions?: ProviderOptions;
  visible: boolean;

  constructor(content: ToolContent, options?: MessageOptions) {
    this.visible = options?.visible ?? true;
    this.content = content;
    this.providerOptions = options?.provider;
  }

  static fromCoreMessage(message: CoreToolMessage) {
    if (message instanceof ToolMessage) return message;
    return new ToolMessage(message.content, message.providerOptions);
  }
}

export class UserMessage implements CoreUserMessage {
  readonly role = MessageRole.User as const;
  readonly content: string;
  readonly providerOptions?: ProviderOptions;
  visible: boolean;

  constructor(content: string, options?: MessageOptions) {
    this.visible = options?.visible ?? true;
    this.content = content;
    this.providerOptions = options?.provider;
  }

  static fromCoreMessage(message: CoreUserMessage) {
    if (message instanceof UserMessage) return message;
    return new UserMessage(
      typeof message.content === "string"
        ? message.content
        : message.content.join(""),
      message.providerOptions
    );
  }
}
