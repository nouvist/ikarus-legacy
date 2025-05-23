import createRendererBridge from "~/renderer/managed/bridge";
import createPlatformManaged from "~/renderer/managed/platform";
import createThemeManaged from "~/renderer/managed/theme";
import createWindowManaged from "~/renderer/managed/window";

export default function createManaged() {
  const bridge = createRendererBridge();
  return {
    bridge,
    platform: createPlatformManaged(),
    theme: createThemeManaged(bridge),
    window: createWindowManaged(bridge),
  };
}
