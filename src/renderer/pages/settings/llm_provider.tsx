import { useEffect, useState } from "react";
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

export default function SettingsPageLlmProvider() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [model, setModel] = useState("");

  async function handleUseOpenAi() {
    setUrl("https://api.openai.com/v1");
    setKey((await managed.env.get("OPENAI_API_KEY")) || "");
    setModel("gpt-3.5-turbo");
  }

  async function handleUseGroq() {
    setUrl("https://api.groq.com/openai/v1");
    setKey((await managed.env.get("GROQ_API_KEY")) || "");
    setModel("qwen/qwen3-32b");
  }

  async function handleUseTogether() {
    setUrl("https://api.together.xyz/v1");
    setKey((await managed.env.get("TOGETHER_API_KEY")) || "");
    setModel("");
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
    setModel("llama3.2:1b");
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
