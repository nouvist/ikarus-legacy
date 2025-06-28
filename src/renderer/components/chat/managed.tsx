import Markdown from "react-markdown";
import { useObservable } from "react-rx";
import Chat, {
  ChatController,
  ChatItem,
  ChatItemAssistent,
  ChatItemType,
  ChatItemUser,
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
  const chats = useObservable(controller.chats());

  return (
    <Chat.Raw.Container>
      {chats?.map((chat) => {
        switch (chat.type) {
          case ChatItemType.User:
            return (
              <Chat.Raw.Bubble.Encapsulate.User>
                <_ChatUser chat={chat} />
              </Chat.Raw.Bubble.Encapsulate.User>
            );
          case ChatItemType.Assistent:
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

interface _ChatProps<Data extends ChatItem> {
  chat: Data;
}

function _ChatUser({ chat }: _ChatProps<ChatItemUser>) {
  return (
    <Chat.Raw.Bubble.User>
      <Markdown>{chat.content}</Markdown>
    </Chat.Raw.Bubble.User>
  );
}

function _ChatAssistent({ chat }: _ChatProps<ChatItemAssistent>) {
  const content = useObservable(chat.content);
  return (
    <Chat.Raw.Bubble.Assistent>
      <Markdown>{content}</Markdown>
    </Chat.Raw.Bubble.Assistent>
  );
}
