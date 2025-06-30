import { ToolCall } from "@langchain/core/dist/messages/tool";
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
  const runner = model.bindTools(tools);

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
    const calls = (async function () {
      const result = await runner.stream(parseMessages(messages));
      const tools = [] as ToolCall[];
      while (true) {
        const next = await result.next();
        if (next.done) break;
        if (next.value.tool_calls) tools.push(...next.value.tool_calls);
        message.subject().next(message.content() + next.value.text);
      }

      message.subject().complete();
      return tools;
    })();
    return [message, calls] as const;
  }

  async function invoke(messages: Message[]) {
    const message = createAssistentMessage();
    const raw = await runner.invoke(parseMessages(messages));
    message.subject().next(raw.text);
    message.subject().complete();
    return [message, raw] as const;
  }

  async function tool(calls: ToolCall[]) {
    const results = ["Tool results:"] as string[];
    for (const call of calls) {
      const tool = tools.find((tool) => tool.name === call.name);
      if (!tool) throw new Error(`Tool ${call.name} not found`);
      const result = await tool.invoke(call.args as any);
      results.push(`${call.name}: ${result}`);
    }
    return createToolMessage(results.join("\n"));
  }

  async function loop(subject: BehaviorSubject<Message[]>) {
    if (
      subject.getValue()[subject.getValue().length - 1].role !==
      MessageRole.User
    ) {
      throw new Error("Last message must be a UserMessage");
    }

    while (true) {
      const [message, promise] = stream(subject.getValue());
      subject.next([...subject.getValue(), message]);
      const calls = await promise;
      if (message.content().length === 0) {
        subject.next(subject.getValue().slice(0, -1));
      }

      if (!calls) break;
      if (calls.length === 0) break;
      subject.next([...subject.getValue(), await tool(calls)]);
    }
  }

  return {
    stream,
    invoke,
    loop,
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
