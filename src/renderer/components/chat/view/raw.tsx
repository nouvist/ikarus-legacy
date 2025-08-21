import {
  ChevronRight24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import {
  Children,
  FragmentProps,
  isValidElement,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { Fragment } from "react/jsx-runtime";
import styled from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import { ColorType, ElevationColor } from "~/renderer/foundations/colors";
import Constraints from "~/renderer/foundations/constraints";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import { bindRefs } from "~/shared/react";

export interface ChatProps extends PropsWithChildren {}

function Chat({ children }: ChatProps) {
  return (
    <Flex fill direction={FlexDirection.Column}>
      {children}
    </Flex>
  );
}

interface ChatInputProps {
  enabled?: boolean;
  clearable?: boolean;
  abortable?: boolean;
  onClear?: () => void;
  onSubmit?: (value: string) => Promise<void>;
  onAbort?: () => void;
}

function ChatInput({
  enabled = true,
  clearable = false,
  abortable = false,
  onClear,
  onSubmit,
  onAbort,
}: ChatInputProps) {
  const input = useRef<HTMLInputElement>(null);
  async function handleSubmit() {
    const text = input.current!.value.trim();
    await onSubmit?.(text);
    input.current!.value = "";
  }

  function handleAbort() {
    input.current!.value = "";
    onAbort?.();
  }

  function handleClear() {
    input.current!.value = "";
    onClear?.();
  }

  return (
    <Card.Constrained
      border={EdgeFlags.top}
      borderColor={ElevationColor.T3}
      padding={EdgeInsets.symmetric({
        horizontal: 32,
        vertical: 20,
      })}
    >
      <Flex fill gap={8}>
        {clearable && (
          <Button
            color={ColorType.Danger}
            padding={EdgeInsets.zero}
            constraints={Constraints.all(40)}
            disabled={!enabled}
            onClick={handleClear}
          >
            <Delete24Regular />
          </Button>
        )}
        <Flex.Fill>
          <Input
            ref={input}
            disabled={!enabled}
            placeholder="Ketik pesan di sini..."
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              handleSubmit();
            }}
          />
        </Flex.Fill>
        {!abortable ? (
          <Button
            disabled={!enabled}
            color={ColorType.Primary}
            padding={EdgeInsets.zero}
            constraints={Constraints.all(40)}
            onClick={handleSubmit}
          >
            <ChevronRight24Regular />
          </Button>
        ) : (
          <Button
            color={ColorType.Danger}
            padding={EdgeInsets.zero}
            constraints={Constraints.all(40)}
            onClick={handleAbort}
          >
            <Dismiss24Regular />
          </Button>
        )}
      </Flex>
    </Card.Constrained>
  );
}

export enum ChatType {
  User,
  Assistent,
}

function ChatContainer({ children }: PropsWithChildren) {
  const scroll = useRef<HTMLDivElement>(null);
  let type: ChatType | undefined;
  let isFirst = true;

  function initScroll(el: HTMLDivElement) {
    if (!el) return;

    const observer = new MutationObserver(handleMutation);

    function scrollToBottom() {
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight + el.clientHeight,
        behavior: "smooth",
      });
    }

    function handleMutation(_: MutationRecord[]) {
      if (!document.body.contains(el)) return observer.disconnect();
      if (el.scrollHeight - el.scrollTop - el.clientHeight > 256) return;
      scrollToBottom();
    }

    setImmediate(scrollToBottom);
    observer.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }

  return (
    <Card.Scroll
      ref={bindRefs(scroll, initScroll)}
      padding={EdgeInsets.symmetric({
        horizontal: 32,
        vertical: 20,
      })}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        if (typeof child.type !== "function") return child;
        if (!("__chatType" in child.type)) return child;
        const nextType = child.type.__chatType as ChatType;

        if (nextType === type) {
          return (
            <Fragment>
              <_Gap />
              {child}
            </Fragment>
          );
        }

        const gap = isFirst ? 0 : 16;
        isFirst = false;
        type = nextType;
        return (
          <Fragment>
            <_Gap $size={gap} />
            <ChatTitle type={type!} />
            <_Gap />
            <Fragment>{child}</Fragment>
          </Fragment>
        );
      })}
    </Card.Scroll>
  );
}

interface _GapProps {
  $size?: number;
}

const _Gap = styled.div<_GapProps>`
  height: ${(p) => p.$size ?? 8}px;
`;

interface ChatTitleProps {
  type: ChatType;
}

function ChatTitle({ type }: ChatTitleProps) {
  const text = type === ChatType.User ? "You" : "Assistant";
  return (
    <_ChatTitle data-from-right={type === ChatType.User}>{text}</_ChatTitle>
  );
}

const _ChatTitle = styled.div`
  font-size: 28px;
  font-weight: 700;
  &[data-from-right="true"] {
    text-align: right;
  }
`;

export interface ChatLoadingProps {}

function ChatLoading(_: ChatLoadingProps) {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 5) return "";
        return prev + ".";
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);
  return <_ChatShared data-left>Memproses{dots}</_ChatShared>;
}

export interface ChatUserProps extends PropsWithChildren {}

function ChatUser({ children }: ChatUserProps) {
  return <_ChatShared data-right>{children}</_ChatShared>;
}

export interface ChatAssistentProps extends PropsWithChildren {}

function ChatAssistent({ children }: ChatAssistentProps) {
  return <_ChatShared data-left>{children}</_ChatShared>;
}

const _ChatShared = styled.div`
  background: ${(p) => p.theme.elevation.t1};
  color: ${(p) => p.theme.foreground.e0};
  box-shadow: inset 0 0 0 1px ${(p) => p.theme.elevation.t1};
  border-radius: 8px;
  padding: 14px 20px;
  user-select: text;

  &[data-right="true"] {
    margin-left: min(120px, 20%);
  }

  &[data-left="true"] {
    margin-right: min(120px, 20%);
  }

  > *:first-child {
    margin-top: 0;
    padding-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  a {
    color: ${(p) => p.theme.accent.primary};
    text-decoration: none;
  }

  hr {
    border: none;
    height: 1px;
    margin: 16px 0;
    background-color: ${(p) => p.theme.elevation.t1};
  }
`;

function encapsulate<T extends object>(component: T, type: ChatType) {
  return Object.assign(component, {
    __chatType: type,
  });
}

export interface ChatThinkingProps extends PropsWithChildren {
  header?: string;
  alwaysExpanded?: boolean;
}

function ChatThinking({ header, alwaysExpanded, children }: ChatThinkingProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Fragment>
      <_ChatThingkingHeader
        onClick={
          alwaysExpanded ? undefined : () => setExpanded((prev) => !prev)
        }
      >
        {header ?? "Thinking..."}
      </_ChatThingkingHeader>
      <_ChatThinking hidden={!expanded && !alwaysExpanded}>
        {children}
      </_ChatThinking>
      <_ChatThinkingMarker />
    </Fragment>
  );
}

const _ChatThingkingHeader = styled.h4`
  margin: 0;
`;

const _ChatThinking = styled.div`
  color: ${(p) => p.theme.foreground.e1};
  user-select: text;
  margin: 0;
`;

const _ChatThinkingMarker = styled.div`
  display: none;
  background-color: ${(p) => p.theme.elevation.t3};
  width: 100%;
  height: 1px;
  margin-top: 12px;
  margin-bottom: 16px;
  &:has(+ *) {
    display: block;
  }
`;

export default Object.assign(Chat, {
  Input: ChatInput,
  Container: ChatContainer,
  Bubble: {
    encapsulate,
    Encapsulate: {
      User: encapsulate(
        (props: FragmentProps) => <Fragment {...props} />,
        ChatType.User
      ),
      Assistent: encapsulate(
        (props: FragmentProps) => <Fragment {...props} />,
        ChatType.Assistent
      ),
      Tool: encapsulate(
        (props: FragmentProps) => <Fragment {...props} />,
        ChatType.Assistent
      ),
    },
    User: encapsulate(ChatUser, ChatType.User),
    Assistent: Object.assign(encapsulate(ChatAssistent, ChatType.Assistent), {
      Thinking: ChatThinking,
    }),
    Loading: encapsulate(ChatLoading, ChatType.Assistent),
  },
});
