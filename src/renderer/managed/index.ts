import createRendererBridge from "~/renderer/managed/bridge";
import createEnvManaged from "~/renderer/managed/env";
import createPlatformManaged from "~/renderer/managed/platform";
import createWebviewManaged from "~/renderer/managed/webview";
import createWindowManaged from "~/renderer/managed/window";

export default function createManaged() {
  const bridge = createRendererBridge();
  return {
    bridge,
    env: createEnvManaged(bridge),
    window: createWindowManaged(bridge),
    platform: createPlatformManaged(),
    webview: createWebviewManaged(),
  };
}
