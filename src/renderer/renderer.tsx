import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "~/renderer/app";

Managed.window.show();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
