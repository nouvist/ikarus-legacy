import Shell from "~/renderer/components/shell";
import Titlebar from "~/renderer/components/titlebar";
import Theme from "~/renderer/components/theme";
import Stack from "~/renderer/components/stack";
import { Fragment, useRef, useState } from "react";

export default function App() {
  const webview = useRef<HTMLWebViewElement>(null);
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
        <Stack activeKey={tab}>
          <Fragment key="chatbot">
            <webview
              ref={webview}
              src="https://github.com"
              style={{
                width: "100vw",
                height: "600px",
              }}
            />
          </Fragment>
          <Fragment key="database">hello guys!</Fragment>
        </Stack>
      </Shell>
    </Theme>
  );
}
