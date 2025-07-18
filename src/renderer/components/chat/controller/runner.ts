import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  EmbeddingModel,
  generateText,
  LanguageModel,
  streamText,
  Tool,
} from "ai";
import { createOllama } from "ollama-ai-provider";
import { BrowserController } from "~/renderer/components/browser";
import {
  AssistantMessage,
  Message,
  SystemMessage,
} from "~/renderer/components/chat/controller/structs";
import createTools from "~/renderer/components/chat/controller/tools";
import { inline } from "~/shared/core";

export default class Runner {
  protected _browser: BrowserController;

  protected _embedding?: EmbeddingModel<string>;
  protected _language?: LanguageModel;
  protected _tools?: Record<string, Tool>;
  protected _system = new SystemMessage(
    inline(`
      Kamu adalah Babon, asisten virtual yang membantu pengguna dengan
      menjelajahi web. Kamu dapat menggunakan alat untuk mendapatkan URL saat
      ini, mengunjungi URL baru, dan berinteraksi dengan halaman web. Gunakan
      alat yang tersedia untuk menyelesaikan tugas yang diberikan.
    `)
  );

  constructor(browser: BrowserController) {
    this._browser = browser;
    this.initializeDebugEnvironment =
      this.initializeDebugEnvironment.bind(this);
  }

  get embedding() {
    if (!this._embedding) throw new Error("Embedding model is not initialized");
    return this._embedding;
  }

  get language() {
    if (!this._language) throw new Error("Language model is not initialized");
    return this._language;
  }

  get tools() {
    if (!this._tools) throw new Error("Tools are not initialized");
    return this._tools;
  }

  async initializeDebugEnvironment() {
    const ollama = createOllama();
    this._embedding = ollama.embedding("nomic-embed-text");
    // this._language = ollama.languageModel("gemma3:1b");
    // this._language = ollama.languageModel("phi3:3.8b");
    const google = createGoogleGenerativeAI({
      apiKey: await Managed.env("GEMINI_API_KEY"),
    });
    this._language = google.languageModel("gemini-2.0-flash");
    this._tools = createTools(this._browser);
  }

  async invoke(message: Message[]) {
    const result = await generateText({
      model: this.language,
      messages: [this._system, ...message],
      tools: this.tools,
      maxSteps: 5,
    });

    const obj = new AssistantMessage(result.text);
    return obj;
  }

  stream(message: Message[]) {
    const stream = streamText({
      model: this.language,
      messages: [this._system, ...message],
      tools: this.tools,
      maxSteps: 5,
    });

    const result = new AssistantMessage("");
    (async () => {
      for await (const chunk of stream.textStream) {
        result.concat(chunk);
      }
      result.complete();
    })();

    return result;
  }
}
