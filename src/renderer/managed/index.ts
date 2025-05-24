import createRendererBridge from "~/renderer/managed/bridge";
import createPlatformManaged from "~/renderer/managed/platform";
import createWindowManaged from "~/renderer/managed/window";

export default function createManaged() {
  const bridge = createRendererBridge();
  return {
    bridge,
    platform: createPlatformManaged(),
    window: createWindowManaged(bridge),
    http: require('http'),
  };
}
