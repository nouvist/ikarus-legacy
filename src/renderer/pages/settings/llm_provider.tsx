import { useState } from "react";
import { styled } from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { JustifyContent } from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import { ColorType } from "~/renderer/foundations/colors";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export default function SettingsPageLlmProvider() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [model, setModel] = useState("");

  function handleUseGoogle() {
    setUrl("https://generativelanguage.googleapis.com/v1beta/openai/");
    setKey("");
    setModel("");
  }

  function handleUseOllama() {
    setUrl("http://127.0.0.1:11434/v1/");
    setKey("ollama");
    setModel("");
  }

  return (
    <Card.Scroll padding={EdgeInsets.all(32)}>
      <Card margin={new EdgeInsets({ bottom: 16 })}>
        Enter your OpenAI-compatible API key below.
      </Card>

      <_Table>
        <tbody>
          <tr>
            <td>URL</td>
            <td>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/"
              />
            </td>
          </tr>

          <tr>
            <td>API Key</td>
            <td>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                type="password"
              />
            </td>
          </tr>

          <tr>
            <td>Model</td>
            <td>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-3.5-turbo"
              />
            </td>
          </tr>
        </tbody>
      </_Table>

      <Flex
        justifyContent={JustifyContent.End}
        margin={new EdgeInsets({ top: 16 })}
        gap={16}
      >
        <Button onClick={handleUseGoogle}>Use Google</Button>
        <Button onClick={handleUseOllama}>Use Ollama</Button>
        <Button color={ColorType.Primary}>Save</Button>
      </Flex>
    </Card.Scroll>
  );
}

const _Table = styled.table`
  max-width: 1024px;
  width: 100%;
  border-spacing: 0 16px;
  margin: -16px 0;
`;
