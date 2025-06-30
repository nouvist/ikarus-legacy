import Markdown from "react-markdown";
import { useObservable } from "react-rx";
import Chat, {
  AssistentMessage,
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
  const readiness = useObservable(controller.readiness());
  async function handleSubmit(value: string) {
    await controller.send(value);
  }

  return <Chat.Raw.Input enabled={readiness} onSubmit={handleSubmit} />;
}

function _ChatLoop({ controller }: _ChatManagedSharedProps) {
  const chats = useObservable(controller.messages());

  return (
    <Chat.Raw.Container>
      {chats?.map((chat) => {
        switch (chat.role) {
          case MessageRole.User:
            return (
              <Chat.Raw.Bubble.Encapsulate.User>
                <_ChatUser chat={chat} />
              </Chat.Raw.Bubble.Encapsulate.User>
            );
          case MessageRole.Assistent:
            return (
              <Chat.Raw.Bubble.Encapsulate.Assistent>
                <_ChatAssistent chat={chat} />
              </Chat.Raw.Bubble.Encapsulate.Assistent>
            );
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
      <Markdown>{chat.content()}</Markdown>
    </Chat.Raw.Bubble.User>
  );
}

function _ChatAssistent({ chat }: _ChatProps<AssistentMessage>) {
  const content = useObservable(chat.subject());
  console.log(content);
  
  if (!content || content.length === 0) return <Chat.Raw.Bubble.Loading />;

  return (
    <Chat.Raw.Bubble.Assistent>
      <Markdown>{content}</Markdown>
    </Chat.Raw.Bubble.Assistent>
  );
}
