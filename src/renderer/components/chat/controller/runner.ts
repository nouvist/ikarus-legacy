import {
  embed,
  EmbeddingModel,
  embedMany,
  generateText,
  LanguageModel,
  streamText,
  Tool,
  ToolResultPart,
} from "ai";
import {
  AssistantMessage,
  Message,
  ToolMessage,
} from "~/renderer/components/chat";
import { RunnerInvokeOptions } from "~/renderer/components/chat/controller/runner_facade";
import { RefCell } from "~/shared/core";

export default class Runner {
  protected _embedding: RefCell<EmbeddingModel<string>>;
  protected _language: RefCell<LanguageModel>;
  protected _tools: Record<string, Tool> = {};

  constructor(
    _embedding: RefCell<EmbeddingModel<string>>,
    _language: RefCell<LanguageModel>,
  ) {
    this._embedding = _embedding;
    this._language = _language;

    this.registerTools = this.registerTools.bind(this);
    this.invoke = this.invoke.bind(this);
    this.stream = this.stream.bind(this);
    this.embed = this.embed.bind(this);
    this.embedMany = this.embedMany.bind(this);
  }

  registerTools(tools: Record<string, Tool>, append = false) {
    if (append) {
      this._tools = { ...this._tools, ...tools };
    } else {
      this._tools = tools;
    }
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
      model: this._language.value,
      messages: messages,
      tools: this._tools,
      maxSteps: maxSteps ?? 5,
      temperature: temperature ?? 0,
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
      model: this._language.value,
      messages: messages,
      tools: this._tools,
      maxSteps: maxSteps ?? 5,
      temperature: temperature ?? 0,
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

  async embed(value: string, abortSignal?: AbortSignal) {
    return embed({
      model: this._embedding.value,
      value: value,
      abortSignal: abortSignal,
    });
  }

  async embedMany(values: string[], abortSignal?: AbortSignal) {
    return embedMany({
      model: this._embedding.value,
      values: values,
      abortSignal: abortSignal,
    });
  }
}
