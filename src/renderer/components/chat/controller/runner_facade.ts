import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { EmbeddingModel, LanguageModel } from "ai";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import Runner from "~/renderer/components/chat/controller/runner";
import { Message } from "~/renderer/components/chat/controller/structs";
import createTools from "~/renderer/components/chat/controller/tools";
import InMemory from "~/renderer/memory";
import { LateRefCell } from "~/shared/core";
import { Mutex } from "~/shared/rxjs";

export interface RunnerInvokeOptions {
  messages: Message[];
  callback: (message: Message) => void;
  abortSignal?: AbortSignal;
  maxSteps?: number;
  temperature?: number;
  frequencyPenalty?: number;
}

export default class RunnerFacade {
  protected _browser = new LateRefCell<BrowserController>();
  protected _embedding = new LateRefCell<EmbeddingModel<string>>();
  protected _language = new LateRefCell<LanguageModel>();

  protected _isInitialized = false;
  protected _memory = new InMemory();
  protected _memoryMutex = new Mutex();

  protected _runner = new Runner(this._embedding, this._language);
  protected _fetcher = new Fetcher(this._browser, this._memory, this._runner);

  readonly mutex = this._fetcher.mutex;
  readonly invoke = this._runner.invoke;
  readonly stream = this._runner.stream;
  readonly embed = this._runner.embed;
  readonly embedMany = this._runner.embedMany;

  constructor() {
    this.ensureInitialized = this.ensureInitialized.bind(this);
    this._initializeDebug = this._initializeDebug.bind(this);
  }

  async ensureInitialized(browser?: BrowserController) {
    await browser?.waitUntilBound();
    if (browser) this._browser.value = browser;
    if (this._isInitialized) return;
    this._isInitialized = true;
    this._runner.registerTools(createTools(this._browser, this._fetcher));
    await this._memory.ensureInitialized();
    await this._initializeDebug();
  }

  async _initializeDebug() {
    const ollama = createOpenAI({
      baseURL: "http://127.0.0.1:11434/v1",
      apiKey: "ollama",
    });

    this._embedding.value = ollama.embedding("nomic-embed-text");
    // this._language.value = ollama.languageModel("qwen3:0.6b");

    const google = createGoogleGenerativeAI({
      apiKey: await managed.env.get("GEMINI_API_KEY"),
    });
    this._language.value = google.languageModel("gemini-2.0-flash-lite");
  }
}
