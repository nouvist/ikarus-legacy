import { ChangeEvent, useEffect, useState } from "react";
import { styled } from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import Flex, { JustifyContent } from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import Modal from "~/renderer/components/modal";
import { ColorType } from "~/renderer/foundations/colors";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";

interface _State {
  changed: boolean;
  url: string;
  key: string;
  model: string;
  dimensions?: number;
}

export function SettingsPageTextEmbeddingProvider() {
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

  function handleDimensions(e: ChangeEvent<HTMLInputElement>) {
    const dimensions = parseInt(e.target.value, 10);
    if (isNaN(dimensions) || state.dimensions === dimensions) return;
    setState((prev) => ({ ...prev, dimensions, changed: true }));
  }

  async function handleUseOpenAi() {
    const env = (await managed.env.get("OPENAI_API_KEY")) || "";
    setState(() => ({
      changed: true,
      url: "https://api.openai.com/v1",
      model: "text-embedding-3-small",
      key: env,
    }));
  }

  function handleUseOllama() {
    setState(() => ({
      changed: true,
      url: "http://127.0.0.1:11434/v1",
      model: "nomic-embed-text:v1.5",
      key: "ollama",
      dimensions: 768,
    }));
  }

  async function handleSave() {
    await RunnerFacade.instance.initializeEmbedding(state as any, true);
    setState((prev) => ({ ...prev, changed: false }));
  }

  function handleRevert() {
    const options = RunnerFacade.instance.getPersistentOptions();
    setState(() => ({
      changed: false,
      url: options.embedding?.url || "",
      key: options.embedding?.key || "",
      model: options.embedding?.model || "",
      dimensions: options.embedding?.dimensions,
    }));
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
                placeholder="text-embedding-3-small"
              />
            </td>
          </tr>

          <tr>
            <td>Dims</td>
            <td>
              <Input
                type="number"
                value={state.dimensions || ""}
                onKeyDown={handleKeyDown}
                onChange={handleDimensions}
                placeholder="768"
              />
            </td>
          </tr>

          <tr>
            <td colSpan={2}>
              Dimensions change requires a restart of the app to take effect.
            </td>
          </tr>

          <tr>
            <td colSpan={2}>Other providers:</td>
          </tr>

          <tr>
            <td colSpan={2}>
              <Flex justifyContent={JustifyContent.Start} gap={16}>
                <Button
                  onClick={handleUseOpenAi}
                  constraints={new Constraints({ height: 40, width: Infinity })}
                >
                  OpenAI
                </Button>
                <Button
                  onClick={handleUseOllama}
                  constraints={new Constraints({ height: 40, width: Infinity })}
                >
                  Ollama
                </Button>
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
                  disabled={
                    !state.changed ||
                    !state.url ||
                    !state.model ||
                    !state.dimensions
                  }
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
