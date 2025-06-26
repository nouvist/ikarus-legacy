import { RendererBridge } from "~/renderer/managed/bridge";

export default function createEnvManaged(bridge: RendererBridge) {
  const cache = {} as Record<string, string | undefined>;
  return {
    get:async (key: string) => {
      return cache[key] ??= await bridge.invoke("Env::get", key);
    }
  };
}
