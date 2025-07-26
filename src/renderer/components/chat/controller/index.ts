import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from "~/renderer/components/chat";
import RunnerFacade from "~/renderer/components/chat/controller/facade";
import { inline } from "~/shared/core";
import { CombinedMutexes, Mutex, waitObservableUntil } from "~/shared/rxjs";

export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= new ChatController(browser));
}

export class ChatController {
  protected _isInitialized = false;
  protected _browser: BrowserController;
  protected _runner = new RunnerFacade();
  protected _messagesMutex = new Mutex();
  protected _mutex = new CombinedMutexes(
    this._messagesMutex,
    this._runner.mutex
  );

  readonly messages = new BehaviorSubject<Message[]>([]);
  readonly mutex = this._mutex.asImmutable();

  protected static _defaultMessages: Message[] | undefined;

  protected static createDefaultMessages() {
    if (!this._defaultMessages) {
      this._defaultMessages = [
        new SystemMessage(
          inline(`
            Kamu adalah Babon, asisten virtual yang membantu pengguna dengan
            menjelajahi web. Kamu hanya fokus pada memberikan hasil yang relevan
            tanpa menjelaskan detail teknis atau cara kerja alat. Kamu harus
            berpikir layaknya sebuah browser. Hasil dari alat yang kamu gunakan
            hanya akan bisa dilihat olehmu dan tidak akan ditampilkan ke
            pengguna. Jadi, kamu perlu menjelaskan atau merangkum hasilnya dalam
            bahasa yang mudah dipahami.
          `)
        ),
        new AssistantMessage(
          inline(`
            Halo! Aku Babon, asisten virtual yang siap bantu kamu menjelajahi
            web. Kasih tahu aku apa yang kamu butuhkan, dan aku bakal kendalikan
            browser untukmu.
          `)
        ),
      ];

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
    this.invoke = this.invoke.bind(this);
    this.concat = this.concat.bind(this);

    (window as any)["chat"] = this;
    (window as any)["msg"] = this.messages.getValue;
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._isInitialized = true;

    await this._runner.initialize(this._browser);
    this.messages.next(ChatController.createDefaultMessages());
    this._messagesMutex.next(true);
  }

  waitUntilReady() {
    return Promise.all([
      this._browser.waitUntilBound(),
      waitObservableUntil(this._messagesMutex, Boolean),
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
      this._messagesMutex.next(false);
      this.concat(new UserMessage(message));
      const abort = new AbortController();
      (window as any)["cancel"] = abort.abort.bind(abort);
      await this._runner.stream({
        messages: this.messages.value,
        callback: this.concat,
        abortSignal: abort.signal,
      });
    } finally {
      this._messagesMutex.next(true);
    }
  }
}
