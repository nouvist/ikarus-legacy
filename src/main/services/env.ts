import MainBridge from "~/main/bridge";

export default class EnvService {
  protected _bridge: MainBridge;

  constructor(bridge: MainBridge) {
    this._bridge = bridge;
    bridge.handle("Env::get", async (_, key) => process.env[key]);
  }
}
