import RendererBridge from "~/preload/services/bridge";

export default class WindowManaged {
  protected _bridge: RendererBridge;

  constructor(bridge: RendererBridge) {
    this._bridge = bridge;
    this.close = this.close.bind(this);
    this.minimize = this.minimize.bind(this);
    this.maximize = this.maximize.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.debug = this.debug.bind(this);
    this.setTitleBarColor = this.setTitleBarColor.bind(this);
    this.setTitleBarSymbolColor = this.setTitleBarSymbolColor.bind(this);
  }

  async close() {
    await this._bridge.invoke("Window::close", undefined);
  }

  async minimize() {
    await this._bridge.invoke("Window::minimize", undefined);
  }

  async maximize() {
    await this._bridge.invoke("Window::maximize", undefined);
  }

  async show() {
    await this._bridge.invoke("Window::show", undefined);
  }

  async hide() {
    await this._bridge.invoke("Window::hide", undefined);
  }

  async debug() {
    await this._bridge.invoke("Window::debug", undefined);
  }

  async setTitleBarColor(color: string) {
    await this._bridge.invoke("Window::setTitleBarColor", color);
  }

  async setTitleBarSymbolColor(color: string) {
    await this._bridge.invoke("Window::setTitleBarSymbolColor", color);
  }
}
