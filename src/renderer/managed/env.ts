import { RendererBridge } from "~/renderer/managed/bridge";

export default function createEnvManaged(bridge: RendererBridge) {
  const cache = {} as Record<string, string | undefined>;
  return async function get(key: string) {
    return (cache[key] ??= await bridge.invoke("Env::get", key));
  };
}
