import { useRef } from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { BrowserController } from "~/renderer/components/browser";
import {
  createRunner,
  createUserMessage,
  Runner,
  Message,
  createAssistentMessage,
} from "~/renderer/components/chat";
import { createRefCell, waitObservableUntil } from "~/shared/core";

export type ChatController = ReturnType<typeof createChatController>;
export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= createChatController(browser));
}

export function createChatController(browser: BrowserController) {
  const llm = createRefCell<Runner | undefined>(undefined);
  const mutex = new BehaviorSubject<boolean>(false);
  const messages = new BehaviorSubject<Message[]>([]);

  async function init() {
    llm.value = await createRunner();
    mutex.next(true);
  }

  function waitUntilReady() {
    return Promise.all([
      browser.waitUntilReady(),
      waitObservableUntil(mutex, Boolean),
    ]);
  }

  async function send(message: string) {
    try {
      mutex.next(false);
      messages.next([...messages.getValue(), createUserMessage(message)]);
      const [response, promise] = llm.value!.stream(messages.getValue());
      messages.next([...messages.getValue(), response]);
      await promise;
    } catch (error) {
      messages.next([
        ...messages.getValue().splice(0, messages.getValue().length - 1),
        createAssistentMessage(`Error: ${error}`),
      ]);
    } finally {
      mutex.next(true);
    }
  }

  init();
  return {
    send,
    waitUntilReady,
    chats: () => messages as Observable<Message[]>,
    readiness: () => mutex as Observable<boolean>,
  };
}
