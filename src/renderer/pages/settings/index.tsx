import { useState } from "react";
import Flex from "~/renderer/components/flex";
import KeyedStack from "~/renderer/components/keyed_stack";
import Tabs from "~/renderer/components/tabs";
import { SettingsPageDebuggingTools } from "~/renderer/pages/settings/debugging_tools";
import SettingsPageLlmProvider from "~/renderer/pages/settings/llm_provider";
import { SettingsPageTextEmbeddingProvider } from "~/renderer/pages/settings/text_embedding_provider";

export default function SettingsPage() {
  const [tab, setTab] = useState(_SettingsTab.LlmProvider);
  return (
    <Flex fill>
      <Flex.Fill>
        <Tabs>
          <Tabs.Item
            selected={tab === _SettingsTab.LlmProvider}
            onClick={() => setTab(_SettingsTab.LlmProvider)}
          >
            LLM Provider
          </Tabs.Item>
          <Tabs.Item
            selected={tab === _SettingsTab.TextEmbeddingProvider}
            onClick={() => setTab(_SettingsTab.TextEmbeddingProvider)}
          >
            Text Embedding Provider
          </Tabs.Item>
          <Tabs.Item
            selected={tab === _SettingsTab.DebuggingTools}
            onClick={() => setTab(_SettingsTab.DebuggingTools)}
          >
            Debugging Tools
          </Tabs.Item>
        </Tabs>
      </Flex.Fill>
      <KeyedStack activeKey={tab}>
        <SettingsPageLlmProvider key={_SettingsTab.LlmProvider} />
        <SettingsPageTextEmbeddingProvider
          key={_SettingsTab.TextEmbeddingProvider}
        />
        <SettingsPageDebuggingTools key={_SettingsTab.DebuggingTools} />
      </KeyedStack>
    </Flex>
  );
}

enum _SettingsTab {
  LlmProvider = "llm-provider",
  TextEmbeddingProvider = "text-embedding-provider",
  DebuggingTools = "debugging-tools",
}
