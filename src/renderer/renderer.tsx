import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "normalize.css/normalize.css";
import Shell from "~/renderer/components/shell";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Shell />
  </StrictMode>
);
