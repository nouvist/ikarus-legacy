import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "~/renderer/app";

managed.window.show();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
