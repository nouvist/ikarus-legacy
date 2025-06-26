import { Children, isValidElement, PropsWithChildren } from "react";
import { Fragment } from "react/jsx-runtime";
import styled from "styled-components";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";

export interface ChatProps extends PropsWithChildren {}

function Chat({ children }: ChatProps) {
  return (
    <Flex direction={FlexDirection.column}>
      <_Scroll>
        <_Separator>{children}</_Separator>
      </_Scroll>
      <Card.Constrained>Hello</Card.Constrained>
    </Flex>
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
