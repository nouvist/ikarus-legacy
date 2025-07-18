import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser";
import {
  Message,
  SystemMessage,
  UserMessage,
} from "~/renderer/components/chat";
import Runner from "~/renderer/components/chat/controller/runner";
import { waitObservableUntil } from "~/shared/core";

export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= new ChatController(browser));
}

export class ChatController {
  protected _browser: BrowserController;
  protected _runner: Runner;

  protected _initiliazed = false;
  protected _mutex = new BehaviorSubject<boolean>(false);
  protected _messages = new BehaviorSubject<Message[]>([]);

  readonly readiness = this._mutex.asObservable();
  readonly messages = this._messages.asObservable();

  static readonly _system = new SystemMessage(
    "Kamu adalah asisten AI bernama Babon."
  );

  constructor(browser: BrowserController) {
    this._browser = browser;
    this._runner = new Runner(browser);

    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.invoke = this.invoke.bind(this);
    this.concat = this.concat.bind(this);

    (window as any)["chat"] = this;
    (window as any)["msg"] = this._messages.getValue;
  }

  async ensureInitialized() {
    if (this._initiliazed) return;
    await this._runner.initializeDebugEnvironment();
    this._messages.next([ChatController._system]);
    this._initiliazed = true;
    this._mutex.next(true);
  }

  waitUntilReady() {
    return Promise.all([
      this._browser.waitUntilReady(),
      waitObservableUntil(this._mutex, Boolean),
    ]);
  }

  concat(next: Message[] | Message) {
    const currentMessages = this._messages.value;
    if (Array.isArray(next)) {
      this._messages.next([...currentMessages, ...next]);
    } else {
      this._messages.next([...currentMessages, next]);
    }
  }

  async invoke(message: string) {
    try {
      this._mutex.next(false);
      this.concat(new UserMessage(message));
      await this._runner.stream(this._messages.value, this.concat);
    } finally {
      this._mutex.next(true);
    }
  }
}
