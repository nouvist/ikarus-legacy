import { useEffect, useState } from "react";
import { styled } from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import Flex, { JustifyContent } from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import { ColorType } from "~/renderer/foundations/colors";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export default function SettingsPageLlmProvider() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [model, setModel] = useState("");

  async function handleUseGroq() {
    setUrl("https://api.groq.com/openai/v1");
    setKey((await managed.env.get("GROQ_API_KEY")) || "");
    setModel("llama-3.1-8b-instant");
  }

  async function handleUseGoogle() {
    setUrl("https://generativelanguage.googleapis.com/v1beta/openai");
    setKey(
      (await managed.env.get("GEMINI_API_KEY")) ||
        (await managed.env.get("GOOGLE_API_KEY")) ||
        ""
    );
    setModel("gemini-2.0-flash");
  }

  function handleUseOllama() {
    setUrl("http://127.0.0.1:11434/v1");
    setKey("ollama");
    setModel("");
  }

  function handleSave() {
    const options = {
      url,
      key,
      model,
    };

    RunnerFacade.instance.initializeLanguage(options, true);
  }

  function handleRevert() {
    const options = RunnerFacade.instance.getPersistentOptions();
    setUrl(options.language?.url || "");
    setKey(options.language?.key || "");
    setModel(options.language?.model || "");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    handleSave();
  }

  useEffect(() => {
    handleRevert();
  }, []);

  return (
    <Card.Scroll padding={EdgeInsets.all(32)}>
      <_Table>
        <tbody>
          <tr>
            <td colSpan={2}>Enter your OpenAI-compatible API key below.</td>
          </tr>

          <tr>
            <td>URL</td>
            <td>
              <Input
                value={url}
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-3.5-turbo"
              />
            </td>
          </tr>

          <tr>
            <td>Templates</td>
            <td>
              <Flex justifyContent={JustifyContent.Start} gap={16}>
                <Button onClick={handleUseGroq}>Groq</Button>
                <Button onClick={handleUseGoogle}>Google</Button>
                <Button onClick={handleUseOllama}>Ollama</Button>
              </Flex>
            </td>
          </tr>

          <tr>
            <td colSpan={2}>
              <Flex justifyContent={JustifyContent.End} gap={16}>
                <Button color={ColorType.Danger} onClick={handleRevert}>
                  Revert
                </Button>
                <Button color={ColorType.Primary} onClick={handleSave}>
                  Save
                </Button>
              </Flex>
            </td>
          </tr>
        </tbody>
      </_Table>
    </Card.Scroll>
  );
}

const _Table = styled.table`
  max-width: 1024px;
  width: 100%;
  border-spacing: 0 16px;
  margin: -16px 0;
`;
