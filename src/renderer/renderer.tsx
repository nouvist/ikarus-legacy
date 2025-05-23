import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "normalize.css/normalize.css";
import Shell from "~/renderer/components/shell";
import Titlebar from "~/renderer/components/titlebar";
import Theme from "~/renderer/components/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme>
      <Shell>
        <Titlebar>
          <Titlebar.Tab selected>Chatbot</Titlebar.Tab>
          <Titlebar.Tab>Database</Titlebar.Tab>
          <Titlebar.Tab>Settings</Titlebar.Tab>
        </Titlebar>
        <div>hello world!</div>
      </Shell>
    </Theme>
  </StrictMode>
);

Managed.window.show();
