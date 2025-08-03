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
  UserMessage,
} from "~/renderer/components/chat";
import { RunnerInvokeOptions } from "~/renderer/components/chat/controller/runner_facade";
import TooManyRequestsController, {
  TooManyRequestsState,
} from "~/renderer/components/chat/controller/too_many_requests_controller";
import { RefCell } from "~/shared/core";

type _CacheId = `${number}::${string}`;

interface _Cached<T> {
  value: T;
  timeout: number;
}

export default class Runner {
  protected _tooManyRequests: TooManyRequestsController;
  protected _embedding: RefCell<EmbeddingModel<string>>;
  protected _language: RefCell<LanguageModel>;
  protected _tools: Record<string, Tool> = {};
  protected _embeddingCache = new Map<_CacheId, _Cached<number[]>>();
  protected _embeddingCacheTimeout?: NodeJS.Timeout;
  protected _languageCache = new Map<string, _Cached<string>>();
  protected _languageCacheTimeout?: NodeJS.Timeout;

  protected static _cacheTimeoutLength = 1000 * 60 * 10;
  protected static _getCacheId(value: string): _CacheId {
    const hash = fnv.hash(value, 64).hex();
    return `${value.length}::${hash}` as const;
  }

  protected static _defaultOptions = {
    maxSteps: 10,
    temperature: 0.7,
    frequencyPenalty: 0.75,
  } satisfies Partial<RunnerInvokeOptions>;

  constructor(
    embedding: RefCell<EmbeddingModel<string>>,
    language: RefCell<LanguageModel>,
    tooManyRequests: TooManyRequestsController
  ) {
    this._tooManyRequests = tooManyRequests;
    this._embedding = embedding;
    this._language = language;

    this.registerTools = this.registerTools.bind(this);
    this.simpleInvoke = this.simpleInvoke.bind(this);
    this.invoke = this.invoke.bind(this);
    this.stream = this.stream.bind(this);
    this.embed = this.embed.bind(this);
    this.embedMany = this.embedMany.bind(this);
    this._handleEmbeddingCacheTimeout =
      this._handleEmbeddingCacheTimeout.bind(this);
    this._handleLanguageCacheTimeout =
      this._handleLanguageCacheTimeout.bind(this);
    this._startEmbeddingCacheTimeout =
      this._startEmbeddingCacheTimeout.bind(this);
    this._startLanguageCacheTimeout =
      this._startLanguageCacheTimeout.bind(this);
    this._isTooManyRequestsError = this._isTooManyRequestsError.bind(this);
  }

  registerTools(tools: Record<string, Tool>, append = false) {
    if (append) {
      this._tools = { ...this._tools, ...tools };
    } else {
      this._tools = tools;
    }
  }

  async simpleInvoke(
    system: string,
    user: string,
    verbose = false,
    cache = true
  ): Promise<string> {
    try {
      this._startLanguageCacheTimeout();

      const cacheId = fnv.hash(`${system}::${user}`, 64).hex();
      let cached = this._languageCache.get(cacheId);
      if (cached) {
        this._languageCache.set(
          cacheId,
          (cached = {
            value: cached.value,
            timeout: Date.now() + Runner._cacheTimeoutLength,
          })
        );
      } else {
        const result = await generateText({
          model: this._language.value,
          messages: [new SystemMessage(system), new UserMessage(user)],
          temperature: 0,
          maxSteps: 1,
        });
        this._languageCache.set(
          cacheId,
          (cached = {
            value: result.text,
            timeout: Date.now() + Runner._cacheTimeoutLength,
          })
        );
      }

      let text = cached.value;
      if (!verbose) {
        const index = text.indexOf("</think>");
        if (index !== -1) text = text.substring(index + 8).trim();
      }

      return text;
    } catch (error) {
      if (!this._isTooManyRequestsError(error)) throw error;
      if (
        (await this._tooManyRequests.markAsAsk()) !== TooManyRequestsState.Retry
      )
        throw error;
      return this.simpleInvoke(system, user, verbose, cache);
    }
  }

  async invoke({
    messages,
    callback,
    abortSignal,
    ...options
  }: RunnerInvokeOptions): Promise<Message[]> {
    try {
      const result = await generateText({
        ...Runner._defaultOptions,
        ...options,
        abortSignal,
        model: this._language.value,
        messages: messages,
        tools: this._tools,
      });

      const next = [] as Message[];
      for (const step of result.steps) {
        if (step.text.length > 0) {
          const message = new AssistantMessage(
            step.text,
            step.providerMetadata
          );
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
    } catch (error) {
      if (!this._isTooManyRequestsError(error)) throw error;
      if (
        (await this._tooManyRequests.markAsAsk()) !== TooManyRequestsState.Retry
      ) {
        throw error;
      }
      return this.invoke({
        ...Runner._defaultOptions,
        ...options,
        messages,
        callback,
        abortSignal,
      });
    }
  }

  async stream({
    messages,
    callback,
    abortSignal,
    ...options
  }: RunnerInvokeOptions): Promise<void> {
    try {
      const stream = streamText({
        ...Runner._defaultOptions,
        ...options,
        abortSignal,
        model: this._language.value,
        messages: messages,
        tools: this._tools,
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
    } catch (error) {
      if (!this._isTooManyRequestsError(error)) throw error;
      if (
        (await this._tooManyRequests.markAsAsk()) !== TooManyRequestsState.Retry
      ) {
        throw error;
      }
      return this.stream({
        ...Runner._defaultOptions,
        ...options,
        messages,
        callback,
        abortSignal,
      });
    }
  }

  async embed(value: string, abortSignal?: AbortSignal): Promise<number[]> {
    try {
      this._startEmbeddingCacheTimeout();

      const id = Runner._getCacheId(value) as _CacheId;
      let cached = this._embeddingCache.get(id);
      if (cached) {
        this._embeddingCache.set(
          id,
          (cached = {
            value: cached.value,
            timeout: Date.now() + Runner._cacheTimeoutLength,
          })
        );
      } else {
        const result = await embed({
          model: this._embedding.value,
          value: value,
          abortSignal: abortSignal,
        });

        this._embeddingCache.set(
          id,
          (cached = {
            value: result.embedding,
            timeout: Date.now() + Runner._cacheTimeoutLength,
          })
        );
      }

      return cached.value;
    } catch (error) {
      if (!this._isTooManyRequestsError(error)) throw error;
      if (
        (await this._tooManyRequests.markAsAsk()) !== TooManyRequestsState.Retry
      ) {
        throw error;
      }
      return this.embed(value, abortSignal);
    }
  }

  async embedMany(
    values: string[],
    abortSignal?: AbortSignal
  ): Promise<number[][]> {
    try {
      this._startEmbeddingCacheTimeout();
      const ids = values.map(Runner._getCacheId);
      const cached = ids.map((id) => this._embeddingCache.get(id));
      const uncachedIndexes = [] as number[];
      const uncachedValues = [] as string[];

      for (let i = 0; i < cached.length; i++) {
        if (cached[i] !== undefined) {
          cached[i] = {
            value: cached[i]!.value,
            timeout: Date.now() + Runner._cacheTimeoutLength,
          };
          continue;
        }
        uncachedIndexes.push(i);
        uncachedValues.push(values[i]);
      }

      const { embeddings } = await embedMany({
        model: this._embedding.value,
        values: uncachedValues,
        abortSignal: abortSignal,
      });

      const timeout = Date.now() + Runner._cacheTimeoutLength;
      for (let i = 0; i < uncachedIndexes.length; i++) {
        const index = uncachedIndexes[i];
        const embedding = embeddings[i];
        this._embeddingCache.set(ids[index], {
          value: embedding,
          timeout,
        });
        cached[index] = {
          value: embedding,
          timeout,
        };
      }

      return cached.map((it) => it!.value);
    } catch (error) {
      if (!this._isTooManyRequestsError(error)) throw error;
      if (
        (await this._tooManyRequests.markAsAsk()) !== TooManyRequestsState.Retry
      ) {
        throw error;
      }
      return this.embedMany(values, abortSignal);
    }
  }

  _handleEmbeddingCacheTimeout() {
    const now = Date.now();
    for (const [key, cached] of this._embeddingCache.entries()) {
      if (cached.timeout <= now) this._embeddingCache.delete(key);
    }
  }

  _handleLanguageCacheTimeout() {
    const now = Date.now();
    for (const [key, cached] of this._languageCache.entries()) {
      if (cached.timeout <= now) this._languageCache.delete(key);
    }
  }

  _startEmbeddingCacheTimeout() {
    clearTimeout(this._embeddingCacheTimeout);
    this._embeddingCacheTimeout = setTimeout(
      this._handleEmbeddingCacheTimeout,
      Runner._cacheTimeoutLength
    );
  }

  _startLanguageCacheTimeout() {
    clearTimeout(this._languageCacheTimeout);
    this._languageCacheTimeout = setTimeout(
      this._handleLanguageCacheTimeout,
      Runner._cacheTimeoutLength
    );
  }

  _isTooManyRequestsError(error: any) {
    console.log(error);
    managed.env.isDebug().then((isDebug) => {
      if (!isDebug) return;
      (window as any).error = error;
    });

    if (typeof error !== "object" || error === null) return false;
    if (!("reason" in error)) return false;
    if (typeof error.reason !== "string") return false;
    return error.reason === "maxRetriesExceeded";
  }
}
