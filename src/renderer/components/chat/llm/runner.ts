import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BehaviorSubject } from "rxjs";
import { createAlertTool } from "~/renderer/components/chat/llm/tool";
import { waitSubjectUntilClosed } from "~/shared/core";

export type Runner = Awaited<ReturnType<typeof createRunner>>;
export async function createRunner() {
  const tools = [createAlertTool()];
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-lite",
    apiKey: await Managed.env("GEMINI_API_KEY"),
  });
  // const runner = model.bindTools(tools);
  const runner = model;

  function parseMessage(message: Message) {
    return {
      role: message.role,
      content: message.content(),
    };
  }

  function parseMessages(messages: Message[]) {
    return [
      parseMessage(createSystemMessage("Kamu adalah AI bernama Babon.")),
      ...messages.map(parseMessage),
    ];
  }

  function stream(messages: Message[]) {
    const message = createAssistentMessage();
    const promise = (async function () {
      const result = await runner.stream(parseMessages(messages));
      while (true) {
        const next = await result.next();
        if (next.done) break;
        message.subject().next(message.content() + next.value.text);
      }
    })();
    return [message, promise] as const;
  }

  return {
    stream,
  };
}

export type Message =
  | AssistentMessage
  | SystemMessage
  | ToolMessage
  | UserMessage;

export enum MessageRole {
  Assistent = "ai",
  System = "system",
  Tool = "tool",
  User = "user",
}

export type AssistentMessage = ReturnType<typeof createAssistentMessage>;
export function createAssistentMessage(content?: string) {
  const subject = new BehaviorSubject<string>(content ?? "");

  return {
    role: MessageRole.Assistent,
    subject: () => subject,
    waitUntilClosed: () => waitSubjectUntilClosed(subject),
    content: () => subject.getValue(),
  } as const;
}

export type SystemMessage = ReturnType<typeof createSystemMessage>;
export function createSystemMessage(content: string) {
  return {
    role: MessageRole.System,
    content: () => content,
  } as const;
}

export type ToolMessage = ReturnType<typeof createToolMessage>;
export function createToolMessage(content: string) {
  return {
    role: MessageRole.Tool,
    content: () => content,
  } as const;
}

export type UserMessage = ReturnType<typeof createUserMessage>;
export function createUserMessage(content: string) {
  return {
    role: MessageRole.User,
    content: () => content,
  } as const;
}
