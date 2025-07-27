import { ToolCallPart } from "ai";
import Markdown from "react-markdown";
import { useObservable } from "react-rx";
import Chat, {
  AssistantMessage,
  ChatController,
  Message,
  MessageRole,
  UserMessage,
} from "~/renderer/components/chat";
import { useObservableWithValue } from "~/shared/react";

interface _ChatManagedSharedProps {
  controller: ChatController;
}

export interface ChatManagedProps extends _ChatManagedSharedProps {}

export default function ChatManaged({ controller }: ChatManagedProps) {
  return (
    <Chat.Raw>
      <_ChatLoop controller={controller} />
      <_ChatInput controller={controller} />
    </Chat.Raw>
  );
}

function _ChatInput({ controller }: _ChatManagedSharedProps) {
  const readiness = useObservable(controller.mutex);
  async function handleSubmit(value: string) {
    await controller.invoke(value);
  }

  return <Chat.Raw.Input enabled={readiness} onSubmit={handleSubmit} />;
}

function _ChatLoop({ controller }: _ChatManagedSharedProps) {
  const chats = useObservableWithValue(controller.messages);

  return (
    <Chat.Raw.Container>
      {chats
        ?.filter((chat) => chat)
        .map((chat) => {
          switch (chat.role) {
            case MessageRole.User:
              return (
                <Chat.Raw.Bubble.Encapsulate.User>
                  <_ChatUser chat={chat} />
                </Chat.Raw.Bubble.Encapsulate.User>
              );
            case MessageRole.Assistant:
              return (
                <Chat.Raw.Bubble.Encapsulate.Assistent>
                  <_ChatAssistent chat={chat} />
                </Chat.Raw.Bubble.Encapsulate.Assistent>
              );
            // case MessageRole.Tool:
            //   return <Chat.Raw.Bubble.Tool results={chat.content} />;
          }
        })}
    </Chat.Raw.Container>
  );
}

interface _ChatProps<Data extends Message> {
  chat: Data;
}

function _ChatUser({ chat }: _ChatProps<UserMessage>) {
  return (
    <Chat.Raw.Bubble.User>
      <Markdown>{chat.content}</Markdown>
    </Chat.Raw.Bubble.User>
  );
}

const _map = {
  "Navigation.getUrl": "Bentar ya, lagi aku cek alamat halamannya...",
  "Navigation.goToUrl":
    "Oke, aku coba buka halaman yang kamu mau. Sabar, ya...",
  "Navigation.goBack":
    "Siap, balik ke halaman sebelumnya nih. Tunggu sebentar...",
  "Navigation.goForward": "Lanjut ke halaman selanjutnya ya. Mohon bersabar...",
  "Button.findBySemantics": "Lagi aku cariin tombolnya nih. Sabar, ya...",
  "Button.clickBySelector": "Ini aku coba klik tombolnya. Tunggu sebentar...",
  "TextInput.findBySemantics":
    "Aku lagi nyari kotak buat nulis teksnya. Mohon tunggu...",
  "TextInput.changeBySelector": "Aku ubah dulu ya isi teksnya. Sabar, ya...",
  "Html.getAllRawHtml":
    "Lagi aku ambil semua 'isi' halaman ini. Tunggu sebentar...",
} as Record<string, string>;

function _ChatAssistent({ chat }: _ChatProps<AssistantMessage>) {
  let content = useObservableWithValue(chat.subject);
  if (!content || content.length === 0) return <Chat.Raw.Bubble.Loading />;

  if (typeof content === "string") {
    let result: string | undefined;
    let thoughts: string | undefined;

    while (content.includes("\n\n")) {
      content = content.replace("\n\n", "\n");
    }

    if (content.startsWith("<think>")) {
      const end = content.indexOf("</think>");
      if (end !== -1) {
        thoughts = content.slice(7, end);
        result = content.slice(end + 8);
      } else {
        thoughts = content.slice(7);
        result = "";
      }
    } else {
      result = content;
    }

    return (
      <Chat.Raw.Bubble.Assistent>
        {thoughts && (
          <Chat.Raw.Bubble.Assistent.Thinking>
            <Markdown>{thoughts}</Markdown>
          </Chat.Raw.Bubble.Assistent.Thinking>
        )}
        {result && <Markdown>{result}</Markdown>}
      </Chat.Raw.Bubble.Assistent>
    );
  }

  if (
    Array.isArray(content) &&
    content.length > 0 &&
    content[0].type === "tool-call"
  ) {
    // TODO: rapihin lagi
    return (
      <Chat.Raw.Bubble.Assistent>
        {(content as ToolCallPart[]).map((part) => {
          return (
            <Chat.Raw.Bubble.Assistent.Thinking
              key={`chat-${part.toolCallId}`}
              header="Ngutak-atik browser..."
            >
              <Markdown>{_map[part.toolName]}</Markdown>
            </Chat.Raw.Bubble.Assistent.Thinking>
          );
        })}
      </Chat.Raw.Bubble.Assistent>
    );
  }

  return (
    <Chat.Raw.Bubble.Assistent>
      [TODO] gak tau ini belum dibuat
    </Chat.Raw.Bubble.Assistent>
  );
}
