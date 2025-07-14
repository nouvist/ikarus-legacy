import {
  AIMessage as RawAssistentMessage,
  AIMessageChunk as RawAssistentMessageChunk,
  HumanMessage as RawHumanMessage,
  ToolMessage as RawToolMessage,
} from "@langchain/core/messages";
import { ToolMessageFieldsWithToolCallId } from "@langchain/core/messages/tool";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { Annotation, StateGraph } from "@langchain/langgraph";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BehaviorSubject } from "rxjs";
import { createAlertTool } from "~/renderer/components/chat/llm/tool";
import { waitSubjectUntilClosed } from "~/shared/core";

export type Runner = Awaited<ReturnType<typeof createRunner>>;
export async function createRunner() {
  const tools = [createAlertTool()];
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-lite",
    apiKey: await Managed.env("GEMINI_API_KEY"),
  });
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text:v1.5",
  });
  const runner = model.bindTools(tools);
  const system = createSystemMessage("Kamu adalah AI bernama Babon.");
  const vectors = new MemoryVectorStore(embeddings);

  function parse(messages: Message[]) {
    return [system.raw(), ...messages.map((message) => message.raw())];
  }

  function stream(messages: Message[]) {
    const message = createAssistentMessage();
    const raw = (async function () {
      const result = await runner.stream(parse(messages));
      let chunk: RawAssistentMessageChunk | undefined;

      while (true) {
        const next = await result.next();
        if (next.done) break;
        if (!chunk) {
          chunk = next.value;
        } else {
          chunk = chunk.concat(next.value);
        }
        message.subject().next(chunk.text);
      }

      message.subject().complete();
      return chunk;
    })();

    return [message, raw] as const;
  }

  async function invoke(messages: Message[]) {
    const message = createAssistentMessage();
    const raw = await runner.invoke(parse(messages));
    message.subject().next(raw.text);
    message.subject().complete();
    return [message, raw] as const;
  }

  // async function setupRag(url: string, selector = "p") {
  // const loader = new CheerioWebBaseLoader(url, { selector });
  // const docs = await loader.load();
  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 1000,
  //   chunkOverlap: 200,
  // });
  // const allSplits = await splitter.splitDocuments(docs);
  // await vectors.addDocuments(allSplits);
  // return allSplits;
  // }

  // function buildPrompt(question: string, context: string) {
  //   return [
  //     createSystemMessage(
  //       "Kamu adalah AI bernama Babon. Jawab pertanyaan berikut dengan menggunakan konteks yang diberikan jika relevan."
  //     ),
  //     createUserMessage(`Pertanyaan: ${question}\nKonteks:\n${context}`),
  //   ];
  // }

  // const InputStateAnnotation = Annotation.Root({
  //   question: Annotation<string>,
  // });

  // const StateAnnotation = Annotation.Root({
  //   question: Annotation<string>,
  //   context: Annotation<Document[]>,
  //   answer: Annotation<string>,
  // });

  // async function retrieve(state: typeof InputStateAnnotation.State) {
  //   const retrievedDocs = await vectors.similaritySearch(state.question);
  //   return { context: retrievedDocs };
  // }

  // async function generate(state: typeof StateAnnotation.State) {
  //   const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
  //   const messages = buildPrompt(state.question, docsContent);
  //   const [msg, raw] = await invoke(messages);
  //   return { answer: msg.content() };
  // }

  // const graph = new StateGraph(StateAnnotation)
  //   .addNode("retrieve", retrieve)
  //   .addNode("generate", generate)
  //   .addEdge("__start__", "retrieve")
  //   .addEdge("retrieve", "generate")
  //   .addEdge("generate", "__end__")
  //   .compile();

  // async function rag(question: string) {
  //   // if (url) await setupRag(url);
  //   const result = await graph.invoke({ question });
  //   return result;
  // }

  return {
    stream,
    invoke,
    // rag,
  };
}

export type Message =
  | AssistentMessage
  | SystemMessage
  | ToolMessage
  | UserMessage;

export enum MessageRole {
  Assistent = "ai",
  System = "system",
  Tool = "tool",
  User = "user",
}

export type AssistentMessage = ReturnType<typeof createAssistentMessage>;
export function createAssistentMessage(content?: string) {
  const subject = new BehaviorSubject<string>(content ?? "");
  let raw: RawAssistentMessage | undefined;

  return {
    role: MessageRole.Assistent,
    subject: () => subject,
    waitUntilClosed: () => waitSubjectUntilClosed(subject),
    content: () => subject.getValue(),
    raw: () => raw ?? new RawAssistentMessage(subject.getValue()),
    setRaw: (value: RawAssistentMessage) => {
      raw = value;
      if (value.text != subject.getValue()) subject.next(value.text);
    },
  } as const;
}

export type SystemMessage = ReturnType<typeof createSystemMessage>;
export function createSystemMessage(content: string) {
  const raw = new RawHumanMessage(content);
  return {
    role: MessageRole.System,
    content: () => content,
    raw: () => raw,
  } as const;
}

export type ToolMessage = ReturnType<typeof createToolMessage>;
export function createToolMessage(fields: ToolMessageFieldsWithToolCallId) {
  const raw = new RawToolMessage(fields);
  return {
    role: MessageRole.Tool,
    content: () =>
      Array.isArray(fields.content)
        ? fields.content.join("\n")
        : fields.content,
    raw: () => raw,
  } as const;
}

export type UserMessage = ReturnType<typeof createUserMessage>;
export function createUserMessage(content: string) {
  const raw = new RawHumanMessage(content);
  return {
    role: MessageRole.User,
    content: () => content,
    raw: () => raw,
  } as const;
}
