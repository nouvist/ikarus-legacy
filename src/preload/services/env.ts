import RendererBridge from "~/preload/services/bridge";

export default class EnvManaged {
  protected _bridge: RendererBridge;
  protected _cache = {} as Record<string, string | undefined>;

  constructor(bridge: RendererBridge) {
    this._bridge = bridge;
    this.get = this.get.bind(this);
    Object.assign(this, this.get);
  }

  async get(key: string) {
    return (this._cache[key] ??= await this._bridge.invoke("Env::get", key));
  }
}
