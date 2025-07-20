import { createOpenAI } from "@ai-sdk/openai";
import {
  EmbeddingModel,
  generateText,
  LanguageModel,
  streamText,
  Tool,
  ToolResultPart,
} from "ai";
import { BrowserController } from "~/renderer/components/browser";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  ToolMessage,
} from "~/renderer/components/chat/controller/structs";
import createTools from "~/renderer/components/chat/controller/tools";
import { inline } from "~/shared/core";

export interface RunnerInvokeOptions {
  messages: Message[];
  callback: (message: Message) => void;
  abortSignal?: AbortSignal;
  maxSteps?: number;
  temperature?: number;
  frequencyPenalty?: number;
}

export default class Runner {
  protected _browser: BrowserController;

  protected _embedding?: EmbeddingModel<string>;
  protected _language?: LanguageModel;
  protected _tools?: Record<string, Tool>;
  protected static _defaultMessages: Message[] | undefined;

  static createDefaultMessages() {
    if (!Runner._defaultMessages) {
      Runner._defaultMessages ??= [
        new SystemMessage(
          inline(`
          Kamu adalah Babon, asisten virtual yang membantu pengguna dengan
          menjelajahi web. Kamu dapat dan memang diperuntukkan untuk menggunakan
          alat-alat yang tersedia untuk membantu pengguna. Kamu boleh membantu
          hal seperti login atau registrasi, dan hal-hal yang bersifat privat
          lainnya, selama kamu menanyakan konsensus pengguna terlebih dahulu.
        `)
        ),
        new AssistantMessage(
          inline(`
          Halo! Aku Babon, asisten virtualmu. Aku bisa bantu kamu menjelajahi
          dan berinteraksi dengan web. Apa yang bisa aku bantu hari ini?
        `)
        ),
      ];

      for (const message of Runner._defaultMessages) {
        if (!(message instanceof AssistantMessage)) continue;
        message.complete();
      }
    }

    return Array.from(Runner._defaultMessages);
  }

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
    const ollama = createOpenAI({
      baseURL: "http://127.0.0.1:11434/v1",
      apiKey: "ollama",
    });

    this._embedding = ollama.embedding("nomic-embed-text");
    this._language = ollama.languageModel("qwen3:0.6b");
    this._tools = createTools(this._browser);

    // const google = createGoogleGenerativeAI({
    //   apiKey: await Managed.env("GEMINI_API_KEY"),
    // });
    // this._language = google.languageModel("gemini-2.0-flash-lite");
  }

  async invoke({
    messages,
    callback,
    abortSignal,
    maxSteps,
    temperature,
    frequencyPenalty,
  }: RunnerInvokeOptions) {
    const result = await generateText({
      abortSignal,
      model: this.language,
      messages: messages,
      tools: this.tools,
      maxSteps: maxSteps ?? 5,
      temperature: temperature ?? 0.4,
      frequencyPenalty: frequencyPenalty ?? 0.75,
    });

    const next = [] as Message[];
    for (const step of result.steps) {
      if (step.text.length > 0) {
        const message = new AssistantMessage(step.text, step.providerMetadata);
        next.push(message);
      }

      if (step.toolCalls.length > 0) {
        const message = new AssistantMessage(
          step.toolCalls,
          step.providerMetadata
        );
        next.push(message);
      }

      if (step.toolResults.length > 0) {
        const message = new ToolMessage(
          step.toolResults,
          step.providerMetadata
        );
        next.push(message);
      }
    }

    console.log(next);
    if (callback) {
      for (const message of next) {
        callback(message);
      }
    }

    return next;
  }

  async stream({
    messages,
    callback,
    abortSignal,
    maxSteps,
    temperature,
    frequencyPenalty,
  }: RunnerInvokeOptions) {
    const stream = streamText({
      abortSignal,
      model: this.language,
      messages: messages,
      tools: this.tools,
      maxSteps: maxSteps ?? 5,
      temperature: temperature ?? 0.4,
      frequencyPenalty: frequencyPenalty ?? 0.75,
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
