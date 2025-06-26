import { useState } from "react";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";
import KeyedStack from "~/renderer/components/keyed_stack";
import Shell from "~/renderer/components/shell";
import Theme from "~/renderer/components/theme";
import Titlebar from "~/renderer/components/titlebar";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import ChatPage from "~/renderer/pages/chat";

enum _AppTab {
  Chat = "chat",
  Database = "database",
  Settings = "settings",
}

export default function App() {
  const [tab, setTab] = useState(_AppTab.Chat);

  return (
    <Theme>
      <Shell>
        <Titlebar>
          <Titlebar.Tab
            onClick={() => setTab(_AppTab.Chat)}
            selected={tab === _AppTab.Chat}
          >
            Chatbot
          </Titlebar.Tab>
          <Titlebar.Tab
            onClick={() => setTab(_AppTab.Database)}
            selected={tab === _AppTab.Database}
          >
            Database
          </Titlebar.Tab>
          <Titlebar.Tab
            onClick={() => setTab(_AppTab.Settings)}
            selected={tab === _AppTab.Settings}
          >
            Settings
          </Titlebar.Tab>
        </Titlebar>
        <Card.Full>
          <KeyedStack activeKey={tab}>
            <ChatPage key={_AppTab.Chat} />
            <Card.Full key={_AppTab.Database}>
              This application is in the early stages of development.
            </Card.Full>
            <Card.Full key={_AppTab.Settings} padding={EdgeInsets.all(20)}>
              <Flex gap={8} direction={FlexDirection.column}>
                <Button onClick={Managed.window.debug}>[Debug] Renderer</Button>
                <Button onClick={() => (window as any)["wv"]?.managed.debug()}>
                  [Debug] Webview
                </Button>
                <br />
                <center>
                  This application is in the early stages of development.
                </center>
              </Flex>
            </Card.Full>
          </KeyedStack>
        </Card.Full>
      </Shell>
    </Theme>
  );
}
