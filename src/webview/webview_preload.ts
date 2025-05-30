import { contextBridge } from "electron";

export default function createBridge() {
  return {
    hello: () => "hello from preload",
  };
}

const bridge = createBridge();
try {
  contextBridge.exposeInMainWorld("Bridge", bridge);
} catch {
  Object.defineProperty(window, "Bridge", {
    value: bridge,
    writable: false,
  });
}

declare global {
  const Bridge: ReturnType<typeof createBridge>;
}
