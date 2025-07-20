import { LanguageModelV1ProviderMetadata } from "@ai-sdk/provider";
import {
  AssistantContent,
  CoreAssistantMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  ToolCallPart,
  ToolContent,
} from "ai";
import { BehaviorSubject } from "rxjs";
import { waitSubjectUntilComplete } from "~/shared/core";

type ProviderOptions = LanguageModelV1ProviderMetadata;

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

export class AssistantMessage implements CoreAssistantMessage {
  readonly role = MessageRole.Assistant as const;
  readonly providerOptions?: ProviderOptions;
  readonly subject = new BehaviorSubject<AssistantContent>("");

  constructor(content?: AssistantContent, providerOptions?: ProviderOptions) {
    this.providerOptions = providerOptions;
    this.next = this.next.bind(this);
    this.concat = this.concat.bind(this);
    this.complete = this.complete.bind(this);
    this.waitUntilComplete = this.waitUntilComplete.bind(this);
    if (content) this.next(content);
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
    return waitSubjectUntilComplete(this.subject);
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

  constructor(content: string, providerOptions?: ProviderOptions) {
    this.content = content;
    this.providerOptions = providerOptions;
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

  constructor(content: ToolContent, providerOptions?: ProviderOptions) {
    this.content = content;
    this.providerOptions = providerOptions;
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

  constructor(content: string, providerOptions?: ProviderOptions) {
    this.content = content;
    this.providerOptions = providerOptions;
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
