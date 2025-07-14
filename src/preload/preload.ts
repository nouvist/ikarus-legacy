import { contextBridge } from "electron";
import createRendererBridge from "~/preload/services/bridge";
import createEnvManaged from "~/preload/services/env";
import createPlatformManaged from "~/preload/services/platform";
import createWebviewManaged from "~/preload/services/webview";
import createWindowManaged from "~/preload/services/window";

export type Managed = ReturnType<typeof createManaged>;
export default function createManaged() {
  const bridge = createRendererBridge();
  const env = createEnvManaged(bridge);
  const window = createWindowManaged(bridge);
  const platform = createPlatformManaged();
  const webview = createWebviewManaged();
  return Object.freeze({
    bridge,
    env,
    window,
    platform,
    webview,
  });
}

const managed = createManaged();
try {
  contextBridge.exposeInMainWorld("Managed", managed);
} catch {
  Object.defineProperty(window, "Managed", {
    value: managed,
    writable: false,
  });
}

declare global {
  const Managed: Managed;
}
