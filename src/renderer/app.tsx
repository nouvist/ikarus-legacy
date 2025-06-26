import { Fragment, useState } from "react";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";
import KeyedStack from "~/renderer/components/keyed_stack";
import Shell from "~/renderer/components/shell";
import Theme from "~/renderer/components/theme";
import Titlebar from "~/renderer/components/titlebar";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import ChatPage from "~/renderer/pages/chat";

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
          <ChatPage key="chatbot" />
          <Fragment key="database">Database</Fragment>
          <Card.Full key="settings" padding={EdgeInsets.all(20)}>
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
      </Shell>
    </Theme>
  );
}
