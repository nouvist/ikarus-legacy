import RendererBridge from "~/preload/services/bridge";

export default class EnvManaged {
  protected _bridge: RendererBridge;
  protected _cache = {} as Record<string, string | undefined>;
  protected _isDebug: boolean | undefined;
  protected _isProfile: boolean | undefined;

  constructor(bridge: RendererBridge) {
    this._bridge = bridge;
    this.get = this.get.bind(this);
    Object.assign(this, this.get);
  }

  async get(key: string) {
    return (this._cache[key] ??= await this._bridge.invoke("Env::get", key));
  }

  async isDebug() {
    if (this._isDebug !== undefined) return this._isDebug;
    return (this._isDebug ??= await this._bridge.invoke("Env::isDebug"));
  }

  async isProfile() {
    if (this._isProfile !== undefined) return this._isProfile;
    return (this._isProfile ??= await this._bridge.invoke("Env::isProfile"));
  }
}
