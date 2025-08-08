import MainBridge from "~/main/bridge";

export default class EnvService {
  protected _bridge: MainBridge;

  constructor(
    bridge: MainBridge,
    isDebugMode: boolean,
    isProfileMode: boolean
  ) {
    this._bridge = bridge;
    bridge.handle("Env::get", async (_, key) => process.env[key]);
    bridge.handle("Env::isDebug", async () => isDebugMode);
    bridge.handle("Env::isProfile", async () => isProfileMode);
  }
}
