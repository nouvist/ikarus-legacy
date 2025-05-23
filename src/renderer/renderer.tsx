import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "normalize.css/normalize.css";
import Shell from "~/renderer/components/shell";
import Titlebar from "~/renderer/components/titlebar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Shell>
      <Titlebar>hello wkwkwk</Titlebar>
      <div>wkwkwk woilah</div>
    </Shell>
  </StrictMode>
);
Managed.window.show();
