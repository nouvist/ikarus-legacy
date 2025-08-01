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
import fnv from "fnv-plus";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  ToolMessage,
} from "~/renderer/components/chat";
import { RunnerInvokeOptions } from "~/renderer/components/chat/controller/runner_facade";
import { RefCell } from "~/shared/core";

type _CacheId = `${number}::${string}`;

export default class Runner {
  protected _embedding: RefCell<EmbeddingModel<string>>;
  protected _language: RefCell<LanguageModel>;
  protected _tools: Record<string, Tool> = {};
  protected _cache = new Map<_CacheId, any>();
  protected _cacheTimeout?: NodeJS.Timeout;

  protected static _cacheTimeoutLength = 1000 * 5;
  protected static _getCacheId(value: string): _CacheId {
    return `${value.length}::${fnv.fast1a64(value)}` as const;
  }

  constructor(
    _embedding: RefCell<EmbeddingModel<string>>,
    _language: RefCell<LanguageModel>
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

  async simpleInvoke(system: string, user: string) {
    const result = await generateText({
      model: this._language.value,
      tools: this._tools,
      maxSteps: 1,
      temperature: 0,
      messages: [new SystemMessage(system), new AssistantMessage(user)],
    });

    return result.text;
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
    this._startCacheTimeout();

    const id = Runner._getCacheId(value) as _CacheId;
    if (this._cache.has(id)) return this._cache.get(id) as number[];

    const result = await embed({
      model: this._embedding.value,
      value: value,
      abortSignal: abortSignal,
    });

    this._cache.set(id, result.embedding);
    return result.embedding;
  }

  async embedMany(values: string[], abortSignal?: AbortSignal) {
    this._startCacheTimeout();
    const ids = values.map(Runner._getCacheId);
    const cached = ids.map((id) => this._cache.get(id) as number[] | undefined);
    const uncachedIndexes = [] as number[];
    const uncachedValues = [] as string[];

    for (let i = 0; i < cached.length; i++) {
      if (cached[i] !== undefined) continue;
      uncachedIndexes.push(i);
      uncachedValues.push(values[i]);
    }

    const { embeddings } = await embedMany({
      model: this._embedding.value,
      values: uncachedValues,
      abortSignal: abortSignal,
    });

    for (let i = 0; i < uncachedIndexes.length; i++) {
      const index = uncachedIndexes[i];
      const embedding = embeddings[i];
      this._cache.set(ids[index], embedding);
      cached[index] = embedding;
    }

    return cached as number[][];
  }

  _startCacheTimeout() {
    clearTimeout(this._cacheTimeout);
    this._cacheTimeout = setTimeout(
      this._cache.clear,
      Runner._cacheTimeoutLength
    );
  }
}
