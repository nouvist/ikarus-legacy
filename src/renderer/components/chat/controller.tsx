import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser";
import { createCompleter, createRefCell, getRandom } from "~/shared/core";

export type ChatController = ReturnType<typeof createChatController>;

export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= createChatController(browser));
}

export enum ChatItemType {
  User = "user",
  Assistent = "ai",
  Tool = "tool",
  System = "system",
}

export type ChatItem = ChatItemUser | ChatItemAssistent;

export interface ChatItemShared {
  key: string;
  type: ChatItemType;
  createdAt: Date;
}

export interface ChatItemUser extends ChatItemShared {
  type: ChatItemType.User;
  content: string;
}

export interface ChatItemAssistent extends ChatItemShared {
  type: ChatItemType.Assistent;
  content: BehaviorSubject<string>;
}

export function createChatController(browser: BrowserController) {
  const completer = createCompleter<void>();
  const model = createRefCell<ChatGoogleGenerativeAI | undefined>(undefined);
  const readiness = new BehaviorSubject<boolean>(false);
  const chats = new BehaviorSubject<ChatItem[]>([]);

  async function init() {
    model.value = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      apiKey: await Managed.env("GEMINI_API_KEY"),
    });
  }

  async function send(message: string) {
    readiness.next(false);

    chats.next([
      ...chats.getValue(),
      {
        key: getRandom(),
        type: ChatItemType.User,
        createdAt: new Date(),
        content: message,
      },
    ]);

    const runner = model.value!;
    try {
      const stream = new BehaviorSubject<string>("");
      const result = await runner.stream([
        {
          role: "system",
          content: "bjir wkwkwk",
        },
        ...chats.getValue().map((chat) => ({
          role: chat.type === ChatItemType.User ? "user" : "assistant",
          content:
            chat.type === ChatItemType.User
              ? chat.content
              : chat.content.getValue(),
        })),
        {
          role: "user",
          content: message,
        },
      ]);

      chats.next([
        ...chats.getValue(),
        {
          key: getRandom(),
          type: ChatItemType.Assistent,
          createdAt: new Date(),
          content: stream,
        },
      ]);

      while (true) {
        const next = await result.next();
        if (next.done) break;
        stream.next(stream.getValue() + next.value.text);
      }
    } finally {
    }
    readiness.next(true);
  }

  completer.encapsulate(init()).then(() => readiness.next(true));
  return {
    send,
    chats: () => chats,
    readiness: () => readiness,
    waitUntilReady: () => {
      return Promise.all([browser.waitUntilReady(), completer.wait()]);
    },
  };
}
