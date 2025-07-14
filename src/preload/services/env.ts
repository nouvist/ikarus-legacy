import { RendererBridge } from "~/preload/services/bridge";

export type EnvManaged = ReturnType<typeof createEnvManaged>;
export default function createEnvManaged(bridge: RendererBridge) {
  const cache = {} as Record<string, string | undefined>;
  return async function get(key: string) {
    return (cache[key] ??= await bridge.invoke("Env::get", key));
  };
}
