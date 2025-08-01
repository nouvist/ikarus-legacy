import { ChangeEvent, useEffect, useState } from "react";
import { styled } from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import Flex, {
  FlexDirection,
  JustifyContent,
} from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import { ColorType } from "~/renderer/foundations/colors";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";

interface _State {
  changed: boolean;
  url: string;
  key: string;
  model: string;
}

export default function SettingsPageLlmProvider() {
  const [state, setState] = useState<_State>({
    changed: false,
    url: "",
    key: "",
    model: "",
  });

  function handleUrl(e: ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    if (state.url === url) return;
    setState((prev) => ({ ...prev, url, changed: true }));
  }

  function handleKey(e: ChangeEvent<HTMLInputElement>) {
    const key = e.target.value;
    if (state.key === key) return;
    setState((prev) => ({ ...prev, key, changed: true }));
  }

  function handleModel(e: ChangeEvent<HTMLInputElement>) {
    const model = e.target.value;
    if (state.model === model) return;
    setState((prev) => ({ ...prev, model, changed: true }));
  }

  async function handleUseOpenAi() {
    const env = (await managed.env.get("OPENAI_API_KEY")) || "";
    setState(() => ({
      changed: true,
      url: "https://api.openai.com/v1",
      model: "gpt-3.5-turbo",
      key: env,
    }));
  }

  async function handleUseGroq() {
    const env = (await managed.env.get("OPENAI_API_KEY")) || "";
    setState(() => ({
      changed: true,
      url: "https://api.groq.com/openai/v1",
      model: "qwen/qwen3-32b",
      key: env,
    }));
  }

  async function handleUseTogether() {
    const env = (await managed.env.get("TOGETHER_API_KEY")) || "";
    setState(() => ({
      changed: true,
      url: "https://api.together.xyz/v1",
      model: "llama3.2:1b",
      key: env,
    }));
  }

  async function handleUseGoogle() {
    const key =
      (await managed.env.get("GEMINI_API_KEY")) ||
      (await managed.env.get("GOOGLE_API_KEY")) ||
      "";
    setState(() => ({
      changed: true,
      url: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-2.0-flash",
      key,
    }));
  }

  function handleUseOllama() {
    setState(() => ({
      changed: true,
      url: "http://127.0.0.1:11434/v1",
      model: "llama3.2:1b",
      key: "ollama",
    }));
  }

  async function handleSave() {
    await RunnerFacade.instance.initializeLanguage(state, true);
    setState((prev) => ({ ...prev, changed: false }));
  }

  function handleRevert() {
    const options = RunnerFacade.instance.getPersistentOptions();
    setState({
      changed: false,
      url: options.language?.url || "",
      key: options.language?.key || "",
      model: options.language?.model || "",
    });
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
                value={state.url}
                onKeyDown={handleKeyDown}
                onChange={handleUrl}
                placeholder="https://api.example.com/"
              />
            </td>
          </tr>

          <tr>
            <td>API Key</td>
            <td>
              <Input
                value={state.key}
                onKeyDown={handleKeyDown}
                onChange={handleKey}
                placeholder="sk-..."
                type="password"
              />
            </td>
          </tr>

          <tr>
            <td>Model</td>
            <td>
              <Input
                value={state.model}
                onKeyDown={handleKeyDown}
                onChange={handleModel}
                placeholder="gpt-3.5-turbo"
              />
            </td>
          </tr>

          <tr>
            <td colSpan={2}>Other providers:</td>
          </tr>

          <tr>
            <td colSpan={2}>
              <Flex
                direction={FlexDirection.Column}
                justifyContent={JustifyContent.Start}
                gap={16}
              >
                <Flex gap={16}>
                  <Button
                    onClick={handleUseOpenAi}
                    constraints={
                      new Constraints({ height: 40, width: Infinity })
                    }
                  >
                    OpenAI
                  </Button>
                  <Button
                    onClick={handleUseGroq}
                    constraints={
                      new Constraints({ height: 40, width: Infinity })
                    }
                  >
                    Groq
                  </Button>
                </Flex>

                <Flex gap={16}>
                  <Button
                    onClick={handleUseTogether}
                    constraints={
                      new Constraints({ height: 40, width: Infinity })
                    }
                  >
                    Together
                  </Button>
                  <Button
                    onClick={handleUseGoogle}
                    constraints={
                      new Constraints({ height: 40, width: Infinity })
                    }
                  >
                    Google
                  </Button>
                </Flex>

                <Flex gap={16}>
                  <Button
                    onClick={handleUseOllama}
                    constraints={
                      new Constraints({ height: 40, width: Infinity })
                    }
                  >
                    Ollama
                  </Button>
                </Flex>
              </Flex>
            </td>
          </tr>

          <tr>
            <td colSpan={2}>
              <Flex justifyContent={JustifyContent.End} gap={16}>
                <Button
                  disabled={!state.changed}
                  color={ColorType.Danger}
                  onClick={handleRevert}
                >
                  Revert
                </Button>
                <Button
                  disabled={!state.changed}
                  color={ColorType.Primary}
                  onClick={handleSave}
                >
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
