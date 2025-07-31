import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from "~/renderer/components/chat";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import { Completer } from "~/shared/core";
import { CombinedMutexes, Mutex, Rxjs } from "~/shared/rxjs";
import prompt from "./prompt_short.txt?raw";

export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= new ChatController(browser));
}

export class ChatController {
  protected _isInitialized = false;
  protected _browser: BrowserController;
  protected _runner = new RunnerFacade();
  protected _messages = new BehaviorSubject<Message[]>([]);
  protected _messagesMutex = new Mutex();
  protected _contentful = new BehaviorSubject<boolean>(false);

  readonly messages = Rxjs.asImmutable(this._messages);
  readonly contentful = Rxjs.asImmutable(this._contentful);
  readonly mutex = new CombinedMutexes(this._messagesMutex, this._runner.mutex);

  protected static _defaultMessages: Message[] | undefined;

  protected static _instance: ChatController | undefined;
  protected static _completer = new Completer();
  static get instance() {
    if (!this._instance) throw new Error("ChatController is not initialized");
    return this._instance;
  }

  static async waitInstance() {
    await this._completer.wait();
    return this.instance;
  }

  protected static createDefaultMessages() {
    if (!this._defaultMessages) {
      this._defaultMessages = [new SystemMessage(prompt)];

      for (const message of this._defaultMessages) {
        if (!(message instanceof AssistantMessage)) continue;
        message.complete();
      }
    }

    return Array.from(this._defaultMessages);
  }

  constructor(browser: BrowserController) {
    this._browser = browser;

    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.clear = this.clear.bind(this);
    this.invoke = this.invoke.bind(this);
    this.concat = this.concat.bind(this);
    this._refreshEmptiness = this._refreshEmptiness.bind(this);

    (window as any)["chat"] = this;
    (window as any)["msg"] = this.messages.getValue;

    if (ChatController._instance) {
      console.warn("[ChatController] ada banyak, yang terakhir yang dipakai");
    }
    ChatController._instance = this;
    ChatController._completer.resolve();
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._isInitialized = true;

    this.clear();
    await this._runner.ensureInitialized(this._browser);
    this._messagesMutex.next(true);
  }

  waitUntilReady() {
    return Promise.all([
      this._browser.waitUntilBound(),
      Rxjs.waitUntil(this._messagesMutex, Boolean),
    ]);
  }

  clear() {
    this._messages.next(ChatController.createDefaultMessages());
    this._contentful.next(false);
  }

  concat(next: Message[] | Message) {
    const currentMessages = this.messages.value;
    if (Array.isArray(next)) {
      this._messages.next([...currentMessages, ...next]);
    } else {
      this._messages.next([...currentMessages, next]);
    }
    this._refreshEmptiness();
  }

  async invoke(message: string, abort?: AbortController) {
    try {
      this._messagesMutex.next(false);
      this.concat(new UserMessage(message));
      (window as any)["cancel"] = abort?.abort.bind(abort);
      await this._runner.stream({
        messages: this.messages.value,
        callback: this.concat,
        abortSignal: abort?.signal,
      });
    } finally {
      this._messagesMutex.next(true);
    }
  }

  protected _refreshEmptiness() {
    for (const message of this.messages.value) {
      if (
        message instanceof UserMessage ||
        message instanceof AssistantMessage
      ) {
        this._contentful.next(true);
        return;
      }
    }
    this._contentful.next(false);
  }
}
