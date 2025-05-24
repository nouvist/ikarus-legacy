import createRendererBridge from "~/renderer/managed/bridge";
import createPlatformManaged from "~/renderer/managed/platform";
import createWebviewManaged from "~/renderer/managed/webview";
import createWindowManaged from "~/renderer/managed/window";

export default function createManaged() {
  const bridge = createRendererBridge();
  return {
    bridge,
    window: createWindowManaged(bridge),
    platform: createPlatformManaged(),
    webview: createWebviewManaged(),
  };
}
