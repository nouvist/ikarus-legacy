import { useEffect, useState } from "react";
import Card from "~/renderer/components/card";
import KeyedStack from "~/renderer/components/keyed_stack";
import Shell from "~/renderer/components/shell";
import Theme from "~/renderer/components/theme";
import Titlebar from "~/renderer/components/titlebar";
import ChatPage from "~/renderer/pages/chat";
import SettingsPage from "~/renderer/pages/settings";

export default function App() {
  const [tab, setTab] = useState(_AppTab.Chat);

  useEffect(() => {
    managed.window.show();
  }, []);

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
            <SettingsPage key={_AppTab.Settings} />
          </KeyedStack>
        </Card.Full>
      </Shell>
    </Theme>
  );
}

enum _AppTab {
  Chat = "chat",
  Database = "database",
  Settings = "settings",
}
