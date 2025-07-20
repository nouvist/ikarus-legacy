import { Children } from "react";
import { styled } from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export default function SettingsPage() {
  return (
    <Card.Scroll padding={EdgeInsets.all(32)}>
      <Flex gap={32} direction={FlexDirection.Column}>
        <_Section title="Debugging Tools">
          <_Horizontal>
            <Button
              constraints={new Constraints({ minHeight: 40, width: Infinity })}
              onClick={managed.window.debug}
            >
              [Debug] Renderer
            </Button>
            <Button
              constraints={new Constraints({ minHeight: 40, width: Infinity })}
              onClick={() => (window as any)["wv"]?.managed.debug()}
            >
              [Debug] Webview
            </Button>
          </_Horizontal>
        </_Section>
        <_Section title="Text Embedding Provider">
          The app is in development; only Ollama and Nomic are supported at the moment.
        </_Section>
        <_Section title="LLM Provider">
          The app is in development; only Gemini is supported at the moment.
        </_Section>
      </Flex>
    </Card.Scroll>
  );
}

function _Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Flex gap={8} direction={FlexDirection.Column}>
      <_Title>{title}</_Title>
      {children}
    </Flex>
  );
}

function _Horizontal({
  children,
  ...props
}: React.ComponentProps<typeof Flex>) {
  return (
    <Flex {...props} direction={FlexDirection.Row} gap={8}>
      {Children.map(children, (child) => (
        <Flex.Fill>{child}</Flex.Fill>
      ))}
    </Flex>
  );
}

const _Title = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 0.4em;
`;
