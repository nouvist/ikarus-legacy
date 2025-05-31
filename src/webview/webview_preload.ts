import { contextBridge } from "electron";
import createWebviewBridge from "~/webview/bridge";
import createJsService from "~/webview/services/js";

export default function createWebviewManaged() {
  const bridge = createWebviewBridge();
  createJsService(bridge);
  return {
    bridge,
  };
}

const bridge = createWebviewManaged();
try {
  contextBridge.exposeInMainWorld("__Managed", bridge);
} catch {
  Object.defineProperty(window, "__Managed", {
    value: bridge,
    writable: false,
  });
}

declare global {
  const __Managed: ReturnType<typeof createWebviewManaged>;
}
