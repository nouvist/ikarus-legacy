import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { EmbeddingModel, LanguageModel } from "ai";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import Runner from "~/renderer/components/chat/controller/runner";
import { Message } from "~/renderer/components/chat/controller/structs";
import createTools from "~/renderer/components/chat/controller/tools";
import InMemory from "~/renderer/memory";
import { Completer, LateRefCell } from "~/shared/core";
import { CombinedMutexes, Mutex } from "~/shared/rxjs";

export interface RunnerInvokeOptions {
  messages: Message[];
  callback: (message: Message) => void;
  abortSignal?: AbortSignal;
  maxSteps?: number;
  temperature?: number;
  frequencyPenalty?: number;
}

export interface OpenAiApiOptions {
  url: string;
  key: string;
  model: string;
}

export type RunnerLanguageOptions = OpenAiApiOptions;
export type RunnerEmbeddingOptions = OpenAiApiOptions;

export interface RunnerPersistentOptions {
  language?: RunnerLanguageOptions;
  embedding?: RunnerEmbeddingOptions;
}

export default class RunnerFacade {
  protected _mutex = new Mutex(false);
  protected _browser = new LateRefCell<BrowserController>();
  protected _embedding = new LateRefCell<EmbeddingModel<string>>();
  protected _language = new LateRefCell<LanguageModel>();
  protected _embeddingDomain: string | undefined;
  protected _languageDomain: string | undefined;

  protected _isInitialized = false;
  protected _memory = new InMemory();
  protected _memoryMutex = new Mutex();

  protected _runner = new Runner(this._embedding, this._language);
  protected _fetcher = new Fetcher(this._browser, this._memory, this._runner);

  readonly invoke = this._runner.invoke;
  readonly stream = this._runner.stream;
  readonly embed = this._runner.embed;
  readonly embedMany = this._runner.embedMany;
  readonly mutex = new CombinedMutexes(
    this._mutex,
    this._memoryMutex,
    this._fetcher.mutex
  );

  protected static _instance: RunnerFacade | undefined;
  protected static _completer = new Completer();
  static get instance() {
    if (!this._instance) throw new Error("RunnerFacade is not initialized");
    return this._instance;
  }

  static async waitInstance() {
    await this._completer.wait();
    return this.instance;
  }

  constructor() {
    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.initializeLanguage = this.initializeLanguage.bind(this);
    this.initializeEmbedding = this.initializeEmbedding.bind(this);
    this.initializeLastUsed = this.initializeLastUsed.bind(this);
    this._refreshMutex = this._refreshMutex.bind(this);

    if (RunnerFacade._instance) {
      console.warn("[RunnerFacade] ada banyak, yang terakhir yang dipakai");
    }
    RunnerFacade._instance = this;
    RunnerFacade._completer.resolve();
  }

  getPersistentOptions(): RunnerPersistentOptions {
    const str = localStorage.getItem("RunnerFacade::options");
    if (!str) return {};
    return JSON.parse(str);
  }

  setPersistentOptions(options: RunnerPersistentOptions, append = true) {
    if (append) {
      const current = this.getPersistentOptions();
      options = {
        ...current,
        ...options,
      };
    }

    localStorage.setItem("RunnerFacade::options", JSON.stringify(options));
  }

  async ensureInitialized(browser?: BrowserController) {
    await browser?.waitUntilBound();
    if (browser) this._browser.value = browser;
    this._refreshMutex();

    if (this._isInitialized) return;
    this._isInitialized = true;

    this._runner.registerTools(createTools(this._browser, this._fetcher));
    await this._memory.ensureInitialized();
    await this.initializeLastUsed();
  }

  async initializeLanguage(options: RunnerLanguageOptions, save = false) {
    const url = new URL(options.url);
    this._languageDomain = `${url.protocol}//${url.host}`;

    if (save) {
      this.setPersistentOptions({
        language: options,
      });
    }

    // - OpenAI compatible buat Google gak jalan untuk `frequencyPenalty`, jadi
    //   kita pakai provider resmi Google.
    // - provider Ollama sama Groq agak cacat kalau streaming, jadi kita pakai
    //   provider OpenAI aja.
    // - yang lain pakai provider OpenAI juga biar praktis.
    if (options.url.startsWith("https://generativelanguage.googleapis.com")) {
      const google = createGoogleGenerativeAI({
        apiKey: options.key,
      });
      this._language.value = google.languageModel(options.model);
    } else {
      const ollama = createOpenAI({
        baseURL: options.url.startsWith("https://api.openai.com")
          ? undefined
          : options.url,
        apiKey: options.key,
      });
      this._language.value = ollama.languageModel(options.model);
    }

    this._refreshMutex();
  }

  async initializeEmbedding(options: RunnerEmbeddingOptions, save = false) {
    const url = new URL(options.url);
    this._embeddingDomain = `${url.protocol}//${url.host}`;

    if (save) {
      this.setPersistentOptions({
        embedding: options,
      });
    }

    const ollama = createOpenAI({
      baseURL: options.url,
      apiKey: options.key,
    });
    this._embedding.value = ollama.embedding(options.model);

    this._refreshMutex();
  }

  async initializeLastUsed() {
    const options = this.getPersistentOptions();
    const promises = [] as Promise<void>[];

    if (options.language) {
      promises.push(this.initializeLanguage(options.language));
    }
    if (options.embedding) {
      promises.push(this.initializeEmbedding(options.embedding));
    }

    await Promise.all(promises);
  }

  protected async _refreshMutex() {
    this._mutex.next(
      this._browser.isInitialized &&
        this._embedding.isInitialized &&
        this._language.isInitialized
    );
  }
}
