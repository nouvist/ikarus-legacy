import { ToolCallPart } from "ai";
import { PropsWithChildren, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useObservable } from "react-rx";
import Card from "~/renderer/components/card";
import Chat, {
  AssistantMessage,
  ChatController,
  Message,
  MessageRole,
  UserMessage,
} from "~/renderer/components/chat";
import Flex, {
  AlignItems,
  FlexDirection,
  JustifyContent,
} from "~/renderer/components/flex";
import Stack from "~/renderer/components/stack";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import { useObservableWithValue } from "~/shared/react";

interface _ChatManagedSharedProps {
  controller: ChatController;
}

export interface ChatManagedProps
  extends _ChatManagedSharedProps,
    PropsWithChildren {}

export default function ChatManaged({
  controller,
  children,
}: ChatManagedProps) {
  return (
    <Stack>
      <Chat.Raw>
        {children}
        <_ChatLoop controller={controller} />
        <_ChatInput controller={controller} />
      </Chat.Raw>
      <_ChatSettingsRequired controller={controller} />
    </Stack>
  );
}

function _ChatSettingsRequired({ controller }: { controller: ChatController }) {
  const mutex = useObservable(controller.runnerMutex);
  return (
    <Stack.Fill hidden={mutex}>
      <Card.Full>
        <Flex
          fill
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.Center}
          alignItems={AlignItems.Center}
        >
          <Card.Constrained
            margin={EdgeInsets.all(16)}
            constraints={new Constraints({ maxWidth: 320 })}
          >
            <h2>Settings Required</h2>
            <p>
              Configure the settings for the language model and embedding
              provider to continue.
            </p>
          </Card.Constrained>
        </Flex>
      </Card.Full>
    </Stack.Fill>
  );
}

function _ChatInput({ controller }: _ChatManagedSharedProps) {
  const abort = useRef<AbortController>(null);
  const readiness = useObservable(controller.mutex);
  const contentful = useObservable(controller.contentful);
  const [abortable, setAbortable] = useState(false);

  function handleClear() {
    controller.clear();
  }

  async function handleSubmit(value: string) {
    setAbortable(true);
    abort.current?.abort();
    abort.current = new AbortController();
    await controller.invoke(value, abort.current);
    setAbortable(false);
  }

  function handleCancel() {
    abort.current?.abort();
  }

  return (
    <Chat.Raw.Input
      enabled={readiness}
      abortable={abortable}
      clearable={contentful}
      onClear={handleClear}
      onSubmit={handleSubmit}
      onAbort={handleCancel}
    />
  );
}

function _ChatLoop({ controller }: _ChatManagedSharedProps) {
  const chats = useObservableWithValue(controller.messages);

  return (
    <Chat.Raw.Container>
      {chats
        ?.filter((chat) => {
          if (!chat) return false;
          if (!chat.visible) return false;
          return true;
        })
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
  "Navigation.getUrl": "Getting current page URL...",
  "Navigation.getTitle": "Checking the page title...",
  "Navigation.goToUrl": "Heading to the new page...",
  "Navigation.goBack": "Going back...",
  "Navigation.goForward": "Moving forward...",

  "Button.findBySemantics": "Looking for a button that fits...",
  "Button.clickBySelector": "Clicking the button...",

  "TextInput.findBySemantics": "Looking for a text field...",
  "TextInput.changeBySelector": "Typing something in...",
  "TextInput.submitBySelector": "Submitting the form...",

  "Html.findElementsBySemantic": "Searching for meaningful content...",
  "Html.findElementsByCluster": "Grouping similar elements...",
  "Html.findClusters": "Looking for patterns on the page...",
  "Html.findClustersBySemantic": "Clustering by meaning...",

  "Csv.getMetadata": "Reading CSV details...",
  "Csv.getRow": "Fetching a row from the data...",
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
              header="Processing..."
              alwaysExpanded
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
