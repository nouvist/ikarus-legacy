import {
  ChatMessage,
  openai,
  OpenAIChatMessage,
  OpenAICompatibleChatModel,
  runTools,
  streamText,
  ToolCall,
  ToolCallResult
} from "modelfusion";
import { BehaviorSubject } from "rxjs";
import { GeminiApiConfiguration } from "~/renderer/components/chat/llm/helpers/openai_compatible";
import Tools from "~/renderer/components/chat/llm/tool";
import { waitSubjectUntilClosed } from "~/shared/core";

export type Runner = Awaited<ReturnType<typeof createRunner>>;
export async function createRunner() {
  const gemini = new OpenAICompatibleChatModel({
    model: "gemini-2.0-flash-lite",
    api: new GeminiApiConfiguration({
      apiKey: (await Managed.env("GEMINI_API_KEY"))!,
    }),
  });

  const system = createSystemMessage("Kamu adalah Babon.");
  const model = gemini;

  function parse(messages: Message[]) {
    return [system.raw(), ...messages.map((message) => message.raw())];
  }

  async function stream(messages: Message[]) {
    const stream = await streamText({
      model: model,
      prompt: parse(messages),
    });
    const message = createAssistentMessage();

    (async () => {
      const subject = message.subject();
      for await (const next of stream) {
        subject.next(subject.getValue() + next);
      }
      subject.complete();
    })();

    return message;
  }

  async function run(messages: Message[]) {
    const result = await runTools({
      model: model,
      prompt: parse(messages),
      tools: Tools.all,
    });

    const arr: Message[] = [];
    if (result.text && result.text.length > 0) {
      arr.push(createAssistentMessage(result.text));
    }
    if (result.toolResults && result.toolResults.length > 0) {
      arr.push(createToolMessage(result.toolResults));
    }

    return arr;
  }

  return {
    stream,
    run,
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
export interface AssistentOptions {
  functionCall?:
    | {
        name: string;
        arguments: string;
      }
    | undefined;
  toolCalls?: ToolCall<string, unknown>[] | null | undefined;
}

export function createAssistentMessage(
  content?: string | null | undefined,
  options?: AssistentOptions
) {
  const subject = new BehaviorSubject<string>(content ?? "");
  let raw: OpenAIChatMessage | undefined;

  return {
    role: MessageRole.Assistent,
    subject: () => subject,
    waitUntilClosed: () => waitSubjectUntilClosed(subject),
    content: () => subject.getValue(),
    raw: () => {
      if (raw) return raw;
      if (subject.closed) {
        return (raw = openai.ChatMessage.assistant(
          subject.getValue(),
          options
        ));
      }
      return openai.ChatMessage.assistant(subject.getValue(), options);
    },
  } as const;
}

export type SystemMessage = ReturnType<typeof createSystemMessage>;
export function createSystemMessage(content: string) {
  let hidden = false;
  const raw = openai.ChatMessage.system(content);

  return {
    role: MessageRole.System,
    content: () => content,
    raw: () => raw,
    hidden: () => hidden,
    hide: () => (hidden = true),
    unhide: () => (hidden = false),
  } as const;
}

export type ToolMessage = ReturnType<typeof createToolMessage>;
export function createToolMessage(
  results: ToolCallResult<string, unknown, unknown>[]
) {
  let hidden = false;
  const raw = ChatMessage.tool({
    toolResults: results,
  });

  return {
    role: MessageRole.Tool,
    content: () =>
      results.map((result) => `${result.tool} ${result.result}`).join("\n"),
    raw: () => raw,
    hidden: () => hidden,
    hide: () => (hidden = true),
    unhide: () => (hidden = false),
  } as const;
}

export type UserMessage = ReturnType<typeof createUserMessage>;
export function createUserMessage(content: string) {
  let hidden = false;
  const raw = openai.ChatMessage.user(content);

  return {
    role: MessageRole.User,
    content: () => content,
    raw: () => raw,
    hidden: () => hidden,
    hide: () => (hidden = true),
    unhide: () => (hidden = false),
  } as const;
}
