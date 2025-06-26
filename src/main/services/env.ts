import { MainBridge } from "~/main/bridge";

export default function createEnvService(bridge: MainBridge) {
  bridge.handle("Env::get", async (_, key) => process.env[key]);
}
