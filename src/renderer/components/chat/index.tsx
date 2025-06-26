import { ChevronRight24Regular } from "@fluentui/react-icons";
import {
  Children,
  isValidElement,
  PropsWithChildren,
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
import EdgeFlags from "~/renderer/foundations/edge_flags";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export interface ChatProps extends PropsWithChildren {}

function Chat({ children }: ChatProps) {
  return (
    <Flex direction={FlexDirection.column}>
      <_Scroll>
        <_Separator>{children}</_Separator>
      </_Scroll>
      <_Input />
    </Flex>
  );
}

interface _InputProps {
  onSubmit?: (value: string) => Promise<void>;
}

function _Input({ onSubmit }: _InputProps) {
  const input = useRef<HTMLInputElement>(null);
  async function handleSubmit() {
    const text = input.current!.value.trim();
    await onSubmit?.(text);
    input.current!.value = "";
  }

  return (
    <Card.Constrained
      border={EdgeFlags.top}
      borderColor={ElevationColor.solid}
      padding={EdgeInsets.symmetric({
        horizontal: 40,
        vertical: 20,
      })}
    >
      <Flex gap={8}>
        <Flex.Fill>
          <Input
            ref={input}
            placeholder="Ketik pesan di sini..."
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              handleSubmit();
            }}
          />
        </Flex.Fill>
        <Button color={ColorType.primary} onClick={handleSubmit}>
          <ChevronRight24Regular />
        </Button>
      </Flex>
    </Card.Constrained>
  );
}

const _Scroll = styled(Card.Full)`
  overflow-y: scroll;
  padding: 40px;

  &::-webkit-scrollbar {
    display: none;
  }

  &:hover {
    padding-right: 20px;
    &::-webkit-scrollbar {
      display: block;
      width: 20px;
    }
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(p) => p.theme.elevation.t2};
    border-radius: 10px;
    border: 6px solid ${(p) => p.theme.background.e0};
    &:hover {
      background-color: ${(p) => p.theme.elevation.t3};
    }
  }
`;

enum ChatType {
  user,
  assistent,
}

function _Separator({ children }: PropsWithChildren) {
  let type: ChatType | undefined;
  let isFirst = true;
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (typeof child.type !== "function") return child;
    if (!("__chatType" in child.type)) return child;
    const nextType = child.type.__chatType as ChatType;

    if (nextType === type) {
      if (isFirst) return child;
      isFirst = false;
      return (
        <Fragment>
          <_Gap />
          {child}
        </Fragment>
      );
    }

    type = nextType;
    return (
      <Fragment>
        <_Gap />
        <ChatTitle type={type!} />
        <Fragment>{child}</Fragment>
      </Fragment>
    );
  });
}

interface _GapProps {
  size?: number;
}

const _Gap = styled.div<_GapProps>`
  height: ${(p) => p.size ?? 8}px;
`;

interface ChatTitleProps {
  type: ChatType;
}

function ChatTitle({ type }: ChatTitleProps) {
  const text = type === ChatType.user ? "Kamu" : "Asisten";
  return (
    <_ChatTitle data-from-right={type === ChatType.user}>{text}</_ChatTitle>
  );
}

const _ChatTitle = styled.div`
  font-size: 28px;
  font-weight: 700;
  &[data-from-right="true"] {
    text-align: right;
  }
`;

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
  border: 1px solid ${(p) => p.theme.elevation.t2};
  border-radius: 8px;
  padding: 14px 20px;
  &[data-right="true"] {
    margin-left: min(120px, 20%);
  }
  &[data-left="true"] {
    margin-right: min(120px, 20%);
  }
`;

function ChatTool() {}

export default Object.assign(Chat, {
  User: Object.assign(ChatUser, {
    __chatType: ChatType.user,
  }),
  Assistent: Object.assign(ChatAssistent, {
    __chatType: ChatType.assistent,
  }),
  Tool: Object.assign(ChatTool, {
    __chatType: ChatType.assistent,
  }),
});
