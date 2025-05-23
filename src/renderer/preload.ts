import { contextBridge } from "electron";
import bridge from "~/renderer/preload/bridge";
import createPlatform from "~/renderer/preload/platform";
import createTheme from "~/renderer/preload/theme";

function createManaged() {
  return {
    bridge,
    platform: createPlatform(),
    theme: createTheme(),
  };
}

contextBridge.exposeInMainWorld("Managed", createManaged());

declare global {
  const Managed: ReturnType<typeof createManaged>;
}
