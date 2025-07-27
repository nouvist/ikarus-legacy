import { createOpenAI } from "@ai-sdk/openai";
import { EmbeddingModel, LanguageModel, Tool } from "ai";
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
  protected _tools = new LateRefCell<Record<string, Tool>>();

  protected _isInitialized = false;
  protected _memory = new InMemory();
  protected _memoryMutex = new Mutex();

  protected _runner = new Runner(this._embedding, this._language, this._tools);
  protected _fetcher = new Fetcher(this._browser, this._memory, this._runner);

  readonly mutex = this._fetcher.mutex;
  readonly invoke = this._runner.invoke;
  readonly stream = this._runner.stream;
  readonly embed = this._runner.embed;
  readonly embedMany = this._runner.embedMany;

  constructor() {
    this.initialize = this.initialize.bind(this);
    this._initializeTools = this._initializeTools.bind(this);
    this._initializeDebug = this._initializeDebug.bind(this);
  }

  async initialize(browser: BrowserController) {
    this._browser.value = browser;

    if (this._isInitialized) return;
    this._isInitialized = true;
    await this._memory.ensureInitialized();
    await this._initializeDebug();
    this._initializeTools();

    await this._browser.value.waitUntilBound();
  }

  _initializeTools() {
    if (this._tools.isInitialized) return;
    this._tools.value = createTools(this._browser.value, this._fetcher);
  }

  async _initializeDebug() {
    const ollama = createOpenAI({
      baseURL: "http://127.0.0.1:11434/v1",
      apiKey: "ollama",
    });

    this._embedding.value = ollama.embedding("nomic-embed-text");
    this._language.value = ollama.languageModel("qwen3:0.6b");
    this._tools.value = createTools(this._browser.value, this._fetcher);

    // const google = createGoogleGenerativeAI({
    //   apiKey: await managed.env.get("GEMINI_API_KEY"),
    // });
    // this._language.value = google.languageModel("gemini-2.0-flash-lite");
  }
}
