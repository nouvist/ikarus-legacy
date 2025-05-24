import { Fragment, useState } from "react";
import Shell from "~/renderer/components/shell";
import KeyedStack from "~/renderer/components/keyed_stack";
import Theme from "~/renderer/components/theme";
import Titlebar from "~/renderer/components/titlebar";
import Chatbot from "~/renderer/pages/chatbot";

export default function App() {
  const [tab, setTab] = useState("chatbot");

  return (
    <Theme>
      <Shell>
        <Titlebar>
          <Titlebar.Tab
            onClick={() => setTab("chatbot")}
            selected={tab === "chatbot"}
          >
            Chatbot
          </Titlebar.Tab>
          <Titlebar.Tab
            onClick={() => setTab("database")}
            selected={tab === "database"}
          >
            Database
          </Titlebar.Tab>
          <Titlebar.Tab
            onClick={() => setTab("settings")}
            selected={tab === "settings"}
          >
            Settings
          </Titlebar.Tab>
        </Titlebar>
        <KeyedStack activeKey={tab}>
          <Chatbot key="chatbot" />
          <Fragment key="database">Database</Fragment>
          <Fragment key="settings">Settings</Fragment>
        </KeyedStack>
      </Shell>
    </Theme>
  );
}
