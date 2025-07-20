import { ChevronRight24Regular } from "@fluentui/react-icons";
import { ToolContent } from "ai";
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
  onSubmit?: (value: string) => Promise<void>;
}

function ChatInput({ enabled = true, onSubmit }: ChatInputProps) {
  const input = useRef<HTMLInputElement>(null);
  async function handleSubmit() {
    const text = input.current!.value.trim();
    await onSubmit?.(text);
    input.current!.value = "";
  }

  return (
    <Card.Constrained
      border={EdgeFlags.top}
      borderColor={ElevationColor.Solid}
      padding={EdgeInsets.symmetric({
        horizontal: 32,
        vertical: 20,
      })}
    >
      <Flex fill gap={8}>
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
        <Button
          disabled={!enabled}
          color={ColorType.Primary}
          padding={EdgeInsets.zero}
          constraints={Constraints.all(40)}
          onClick={handleSubmit}
        >
          <ChevronRight24Regular />
        </Button>
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

    function handleMutation(_: MutationRecord[]) {
      if (!document.body.contains(el)) return observer.disconnect();
      el.scrollTo({
        top: el.scrollHeight + el.clientHeight,
        behavior: "smooth",
      });
    }

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
  const text = type === ChatType.User ? "Kamu" : "Asisten";
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
  overflow-wrap: break-word;

  &[data-right="true"] {
    margin-left: min(120px, 20%);
  }

  &[data-left="true"] {
    margin-right: min(120px, 20%);
  }

  > * {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
  }

  > *:nth-child(1) {
    margin-top: 0;
  }

  > *:nth-last-child(1) {
    margin-bottom: 0;
  }

  > ul {
    padding-inline-start: 2em;
  }

  > a {
    color: ${(p) => p.theme.accent.primary};
    text-decoration: none;
  }
`;

interface ChatToolProps {
  results: ToolContent;
}

function ChatTool({ results }: ChatToolProps) {
  return (
    <_ChatShared data-left>
      {results.map((result, index) => (
        <div key={index}>
          <h3>{result.toolName}</h3>
        </div>
      ))}
    </_ChatShared>
  );
}

function encapsulate<T extends object>(component: T, type: ChatType) {
  return Object.assign(component, {
    __chatType: type,
  });
}

export interface ChatThinkingProps extends PropsWithChildren {}

function ChatThinking({ children }: ChatThinkingProps) {
  return (
    <Fragment>
      <h4>Berpikir</h4>
      <_ChatThinking>{children}</_ChatThinking>
    </Fragment>
  );
}

const _ChatThinking = styled.div`
  color: ${(p) => p.theme.foreground.e1};
  user-select: text;
  overflow-wrap: break-word;
  margin: 0;
  &:has(+ *) {
    border-bottom: 1px solid ${(p) => p.theme.elevation.t3};
    margin-bottom: 0.5em;
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
    Tool: encapsulate(ChatTool, ChatType.Assistent),
    Loading: encapsulate(ChatLoading, ChatType.Assistent),
  },
});
