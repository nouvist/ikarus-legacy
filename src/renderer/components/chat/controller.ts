import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { useRef } from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { BrowserController } from "~/renderer/components/browser";
import { createRefCell, getRandom, waitObservableUntil } from "~/shared/core";

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
  const model = createRefCell<ChatGoogleGenerativeAI | undefined>(undefined);
  const mutex = new BehaviorSubject<boolean>(false);
  const chats = new BehaviorSubject<ChatItem[]>([]);

  async function init() {
    model.value = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      apiKey: await Managed.env("GEMINI_API_KEY"),
    });
    mutex.next(true);
  }

  function waitUntilReady() {
    return Promise.all([
      browser.waitUntilReady(),
      waitObservableUntil(mutex, Boolean),
    ]);
  }

  async function send(message: string) {
    mutex.next(false);

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
      mutex.next(true);
    }
  }

  init();
  return {
    send,
    waitUntilReady,
    chats: () => chats as Observable<ChatItem[]>,
    readiness: () => mutex as Observable<boolean>,
  };
}
