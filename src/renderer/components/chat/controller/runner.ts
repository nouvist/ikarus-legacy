import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  EmbeddingModel,
  generateText,
  LanguageModel,
  streamText,
  Tool,
  ToolResultPart,
} from "ai";
import { createOllama } from "ollama-ai-provider";
import { BrowserController } from "~/renderer/components/browser";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  ToolMessage,
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

  async invoke(messages: Message[]) {
    const result = await generateText({
      model: this.language,
      messages: [this._system, ...messages],
      tools: this.tools,
      maxSteps: 5,
    });

    const next = [] as Message[];
    for (const step of result.steps) {
      const isLast = step === result.steps[result.steps.length - 1];

      const message = new AssistantMessage(
        step.toolCalls.length > 0 ? step.toolCalls : step.text,
        step.providerMetadata
      );
      next.push(message);
      message.isReasonable = !isLast;

      if (step.toolResults.length > 0) {
        const message = new ToolMessage(
          step.toolResults,
          step.providerMetadata
        );
        next.push(message);
      }
    }

    console.log(next);
    return next;
  }

  async stream(messages: Message[], callback: (message: Message) => void) {
    const stream = streamText({
      model: this.language,
      messages: [this._system, ...messages],
      tools: this.tools,
      maxSteps: 5,
    });

    let last: Message | undefined;
    function completeLast() {
      if (!(last instanceof AssistantMessage)) return;
      last.complete();
    }

    for await (const chunk of stream.fullStream) {
      console.log(chunk);
      if (chunk.type === "tool-call") {
        if (
          last instanceof AssistantMessage &&
          AssistantMessage.isToolCall(last.content)
        ) {
          last.content.push(chunk);
        } else {
          completeLast();
          callback((last = new AssistantMessage([chunk])));
        }
      }

      if ((chunk.type as string) === "tool-result") {
        const chunkAsTool = chunk as any as ToolResultPart;
        if (last instanceof ToolMessage) {
          last.content.push(chunkAsTool);
        } else {
          completeLast();
          callback((last = new ToolMessage([chunkAsTool])));
        }
      }

      if (chunk.type === "text-delta") {
        if (last instanceof AssistantMessage) {
          last.concat(chunk.textDelta);
        } else {
          completeLast();
          callback((last = new AssistantMessage(chunk.textDelta)));
        }
      }
    }
  }
}
