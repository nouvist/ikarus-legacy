import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser";
import { Message, UserMessage } from "~/renderer/components/chat";
import Runner from "~/renderer/components/chat/controller/runner";
import { waitObservableUntil } from "~/shared/core";

export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= new ChatController(browser));
}

export class ChatController {
  protected _initiliazed = false;
  protected _browser: BrowserController;
  protected _runner: Runner;

  readonly mutex = new BehaviorSubject<boolean>(false);
  readonly messages = new BehaviorSubject<Message[]>([]);

  constructor(browser: BrowserController) {
    this._browser = browser;
    this._runner = new Runner(browser);

    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.invoke = this.invoke.bind(this);
    this.concat = this.concat.bind(this);

    (window as any)["chat"] = this;
    (window as any)["msg"] = this.messages.getValue;
  }

  async ensureInitialized() {
    if (this._initiliazed) return;
    await this._runner.initializeDebugEnvironment();
    this.messages.next(Runner.createDefaultMessages());
    this._initiliazed = true;
    this.mutex.next(true);
  }

  waitUntilReady() {
    return Promise.all([
      this._browser.waitUntilReady(),
      waitObservableUntil(this.mutex, Boolean),
    ]);
  }

  concat(next: Message[] | Message) {
    const currentMessages = this.messages.value;
    if (Array.isArray(next)) {
      this.messages.next([...currentMessages, ...next]);
    } else {
      this.messages.next([...currentMessages, next]);
    }
  }

  async invoke(message: string) {
    try {
      this.mutex.next(false);
      this.concat(new UserMessage(message));
      await this._runner.stream({
        messages: this.messages.value,
        callback: this.concat,
      });
    } finally {
      this.mutex.next(true);
    }
  }
}
