import { ToolCallPart } from "ai";
import Markdown from "react-markdown";
import { useObservable } from "react-rx";
import { Fragment } from "react/jsx-runtime";
import Chat, {
  AssistantMessage,
  ChatController,
  Message,
  MessageRole,
  UserMessage,
} from "~/renderer/components/chat";

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
  const readiness = useObservable(controller.readiness);
  async function handleSubmit(value: string) {
    await controller.invoke(value);
  }

  return <Chat.Raw.Input enabled={readiness} onSubmit={handleSubmit} />;
}

function _ChatLoop({ controller }: _ChatManagedSharedProps) {
  const chats = useObservable(controller.messages);

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

function _ChatAssistent({ chat }: _ChatProps<AssistantMessage>) {
  const content = useObservable(chat.observable);
  if (!content || content.length === 0) return <Chat.Raw.Bubble.Loading />;
  if (typeof content === "string") {
    return (
      <Chat.Raw.Bubble.Assistent>
        <Markdown>{content}</Markdown>
      </Chat.Raw.Bubble.Assistent>
    );
  }

  if (
    Array.isArray(content) &&
    content.length > 0 &&
    content[0].type === "tool-call"
  ) {
    return (
      <Chat.Raw.Bubble.Assistent>
        <div>
          <b>[TODO] </b>
          UI-nya rapiin lagi
        </div>
        {(content as ToolCallPart[]).map((part, index) => {
          return (
            <div key={`chat-${part.toolCallId}`}>
              Memanggil {part.toolName}...
            </div>
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
