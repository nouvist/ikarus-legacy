import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { EmbeddingModel, LanguageModel } from "ai";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import Runner from "~/renderer/components/chat/controller/runner";
import {
  Message,
  UserMessage,
} from "~/renderer/components/chat/controller/structs";
import TooManyRequestsController from "~/renderer/components/chat/controller/too_many_requests_controller";
import createTools from "~/renderer/components/chat/controller/tools";
import { CsvController } from "~/renderer/components/csv";
import InMemory from "~/renderer/memory";
import { ElementData } from "~/renderer/memory/tables/html";
import { Completer, LateRefCell } from "~/shared/core";
import { Mutex, Rxjs } from "~/shared/rxjs";

export interface RunnerInvokeRequest {
  maxSteps?: number;
  temperature?: number;
  frequencyPenalty?: number;
}

export interface RunnerInvokeOptions {
  getMessages: () => Message[];
  setMessages: (messages: Message[]) => void;
  concatMessages: (messages: Message[] | Message) => void;
  abortSignal?: AbortSignal;
  request?: RunnerInvokeRequest;
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
  protected _csv = new LateRefCell<CsvController>();
  protected _embeddingDomain: string | undefined;
  protected _languageDomain: string | undefined;
  readonly tooManyRequests = new TooManyRequestsController();

  protected _isInitialized = false;
  protected _memory = new InMemory();

  protected _runner = new Runner(
    this._embedding,
    this._language,
    this.tooManyRequests
  );
  protected _fetcher = new Fetcher(this._browser, this._memory, this._runner);

  readonly invoke = this._runner.invoke;
  readonly stream = this._runner.stream;
  readonly embed = this._runner.embed;
  readonly embedMany = this._runner.embedMany;
  readonly mutex = Rxjs.asImmutable(this._mutex);

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
    this.execute = this.execute.bind(this);
    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.getPersistentOptions = this.getPersistentOptions.bind(this);
    this.setPersistentOptions = this.setPersistentOptions.bind(this);
    this.initializeLanguage = this.initializeLanguage.bind(this);
    this.initializeEmbedding = this.initializeEmbedding.bind(this);
    this.initializeLastUsed = this.initializeLastUsed.bind(this);
    this._createContext = this._createContext.bind(this);
    this._createTimeContext = this._createTimeContext.bind(this);
    this._createUrlContext = this._createUrlContext.bind(this);
    this._createHtmlContext = this._createHtmlContext.bind(this);
    this._createCsvContext = this._createCsvContext.bind(this);
    this._refreshMutex = this._refreshMutex.bind(this);

    if (RunnerFacade._instance) {
      console.warn("[RunnerFacade] ada banyak, yang terakhir yang dipakai");
    }
    RunnerFacade._instance = this;
    RunnerFacade._completer.resolve();
  }

  async execute({
    abortSignal,
    concatMessages,
    getMessages,
    setMessages,
    ...options
  }: RunnerInvokeOptions) {
    const context = await this._createContext();
    let messages = getMessages();

    if (
      messages.length > 0 &&
      messages[messages.length - 1] instanceof UserMessage
    ) {
      setMessages([
        ...messages.slice(0, -1),
        context,
        messages[messages.length - 1],
      ]);
    } else {
      concatMessages(context);
    }

    await this.stream({
      ...options,
      abortSignal,
      concatMessages,
      getMessages,
      setMessages,
    });
  }

  async ensureInitialized({
    csv,
    browser,
  }: {
    csv?: CsvController;
    browser?: BrowserController;
  }) {
    await browser?.waitUntilBound();
    if (browser) this._browser.value = browser;
    if (csv) this._csv.value = csv;
    this._refreshMutex();

    if (this._isInitialized) return;
    this._isInitialized = true;

    const tools = createTools(
      this._browser.value,
      this._csv.value,
      this._fetcher
    );

    this._runner.registerTools(tools);
    await this._memory.ensureInitialized();
    await this.initializeLastUsed();
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

  protected async _createContext(extra?: string[]) {
    console.log(this);
    const context = [] as string[];
    await this._createTimeContext(context);
    await this._createUrlContext(context);
    await this._createHtmlContext(context);
    await this._createCsvContext(context);

    if (extra) context.push(...extra);

    context.push();
    ("Use tools to interact with the browser and read the CSV data.");
    context.unshift("<system>");
    context.push("</system>");

    return new UserMessage(context.join("\n"), {
      // visible: await managed.env.isDebug(),
      // visible: false,
    });
  }

  protected async _createTimeContext(context: string[]) {
    const date = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
    }).format(date);
    context.push(`Current time: ${formattedDate}.`);
  }

  protected async _createUrlContext(context: string[]) {
    const url = this._browser.value.url();
    if (url.length > 0) {
      const title = await this._browser.value.title();
      context.push("Current URL: " + url);
      if (title) context.push("Current Title: " + title);
    } else {
      context.push("No URL is loaded in the browser.");
    }
  }

  protected async _createHtmlContext(context: string[]) {
    return;

    if (this._browser.value.url().length === 0) return;
    const clusters = (await this._fetcher.findClusters()).sort(
      (a, b) => b.elements - a.elements
    );
    const representatives = [] as (ElementData | undefined)[];
    for (const cluster of clusters) {
      const elements = await this._fetcher.findElementsByCluster(
        cluster.hash,
        1
      );
      representatives.push(...elements);
    }

    context.push(`${clusters.length} HTML clusters found.`);
    for (let i = 0; i < 5 && i < clusters.length; i++) {
      const cluster = clusters[i];
      const representative = representatives[i];
      let text = representative?.text || "None";
      if (text.length > 110) text = text.substring(0, 100) + "...";

      context.push(`- Hash: ${cluster.hash}`);
      context.push(`  Keywords: ${Array.from(cluster.keywords).join(", ")}`);
      context.push(`  Elements: ${cluster.elements}`);
      context.push(`  Representative: ${text}`);
    }
    if (clusters.length > 5) {
      context.push(`... and ${clusters.length - 5} more clusters.`);
    }

    const inputs = await this._fetcher.fetchTextInputs();
    const buttons = await this._fetcher.fetchButtons();
    context.push(`Input fields: ${inputs?.length || 0}`);
    context.push(`Buttons and anchors: ${buttons?.length || 0}`);
  }

  protected async _createCsvContext(context: string[]) {
    const csv = await this._csv.value.parse();
    if (csv && csv.data.length > 0) {
      context.push(`CSV rows: ${csv.data.length}`);
      context.push(
        `CSV headers: ${Object.keys(csv.data[0])
          .map((key) => JSON.stringify(key))
          .join(", ")}`
      );
    } else {
      context.push("No CSV file is loaded.");
      context.push("CSV rows: 0");
      context.push("CSV headers: [user has not selected a CSV file]");
    }
  }

  protected async _refreshMutex() {
    this._mutex.next(
      this._browser.isInitialized &&
        this._embedding.isInitialized &&
        this._language.isInitialized
    );
  }
}
