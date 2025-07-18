import { LanguageModelV1ProviderMetadata } from "@ai-sdk/provider";
import {
  AssistantContent,
  CoreAssistantMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  ToolCall,
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

  protected _subject = new BehaviorSubject<AssistantContent>("");
  readonly observable = this._subject.asObservable();

  isReasonable = false;

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

  get content() {
    return this._subject.value;
  }

  get isCompleted() {
    return this._subject.closed;
  }

  complete() {
    this._subject.complete();
  }

  waitUntilComplete() {
    return waitSubjectUntilComplete(this._subject);
  }

  next(content: AssistantContent) {
    this._subject.next(content);
  }

  concat(content: string) {
    if (typeof this.content !== "string") {
      throw new Error("Cannot concat to non-string content");
    }
    this._subject.next(this.content + content);
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
