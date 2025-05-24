import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "~/renderer/app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>
);

Managed.window.show();
