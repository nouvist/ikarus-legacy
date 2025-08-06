import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from "~/renderer/components/chat";
import Prompts from "~/renderer/components/chat/controller/prompts";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import { CsvController } from "~/renderer/components/csv";
import { Completer } from "~/shared/core";
import { CombinedMutexes, Mutex, Rxjs } from "~/shared/rxjs";

export function useChatController(
  csv: CsvController,
  browser: BrowserController
) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= new ChatController(csv, browser));
}

export class ChatController {
  protected _isInitialized = false;
  protected _csv: CsvController;
  protected _browser: BrowserController;
  protected _runner = new RunnerFacade();
  protected _messages = new BehaviorSubject<Message[]>([]);
  protected _messagesMutex = new Mutex();
  protected _contentful = new BehaviorSubject<boolean>(false);

  readonly messages = Rxjs.asImmutable(this._messages);
  readonly contentful = Rxjs.asImmutable(this._contentful);
  readonly mutex = new CombinedMutexes(this._messagesMutex, this._runner.mutex);
  readonly runnerMutex = this._runner.mutex;
  readonly tooManyRequests = this._runner.tooManyRequests;

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
      // this._defaultMessages = [new SystemMessage(Prompts.getSystemPropmt())];
      this._defaultMessages = [];

      for (const message of this._defaultMessages) {
        if (!(message instanceof AssistantMessage)) continue;
        message.complete();
      }
    }

    return Array.from(this._defaultMessages);
  }

  constructor(csv: CsvController, browser: BrowserController) {
    this._csv = csv;
    this._browser = browser;

    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.clear = this.clear.bind(this);
    this.invoke = this.invoke.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.concat = this.concat.bind(this);
    this._refreshEmptiness = this._refreshEmptiness.bind(this);
    this._exposeDebug = this._exposeDebug.bind(this);

    if (ChatController._instance) {
      console.warn("[ChatController] ada banyak, yang terakhir yang dipakai");
    }

    ChatController._instance = this;
    ChatController._completer.resolve();
    this._exposeDebug();
  }

  protected async _exposeDebug() {
    if (!(await managed.env.isDebug())) return;
    Object.assign(window, {
      ChatController: ChatController,
      chat: this,
    });
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._isInitialized = true;

    this.clear();
    await this._runner.ensureInitialized({
      csv: this._csv,
      browser: this._browser,
    });

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

  get() {
    return this._messages.value;
  }

  set(messages: Message[]) {
    this._messages.next(messages);
    this._refreshEmptiness();
  }

  concat(next: Message[] | Message) {
    const currentMessages = this.messages.value;
    this.set(
      Array.isArray(next)
        ? [...currentMessages, ...next]
        : [...currentMessages, next]
    );
  }

  async invoke(message: string, abort?: AbortController) {
    try {
      this._messagesMutex.next(false);
      this.concat(new UserMessage(message));
      await this._runner.execute({
        abortSignal: abort?.signal,
        concatMessages: this.concat,
        getMessages: this.get,
        setMessages: this.set,
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
