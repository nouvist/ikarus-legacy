import { Fragment, useState } from "react";
import Shell from "~/renderer/components/shell";
import KeyedStack from "~/renderer/components/keyed_stack";
import Theme from "~/renderer/components/theme";
import Titlebar from "~/renderer/components/titlebar";
import Chatbot from "~/renderer/pages/chatbot";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import Flex from "~/renderer/components/flex";

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
          <Card.Full key="settings" padding={EdgeInsets.all(20)}>
            <Flex gap={8} direction="column">
              <Button onClick={Managed.window.debug}>[Debug] Renderer</Button>
              <Button
                onClick={() => (window as any)["wv"]?.managed.debug()}
              >
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
