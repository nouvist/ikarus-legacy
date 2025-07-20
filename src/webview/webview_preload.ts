import { contextBridge } from "electron";
import WebviewBridge from "~/webview/bridge";
import JsService from "~/webview/services/js";

export default class WebviewManaged {
  private _bridge: WebviewBridge;

  constructor() {
    this._bridge = new WebviewBridge();
    this._bridge.register(new JsService());
  }

  get bridge() {
    return this._bridge;
  }

  expose() {
    try {
      contextBridge.exposeInMainWorld("__Managed", WebviewManaged);
      contextBridge.exposeInMainWorld("__managed", this);
    } catch {
      Object.defineProperties(window, {
        __Managed: {
          value: WebviewManaged,
          writable: false,
        },
        __managed: {
          value: this,
          writable: false,
        },
      });
    }
  }
}

const bridge = new WebviewManaged();
bridge.expose();

declare global {
  const __Managed: WebviewManaged;
  const __managed: WebviewManaged;
}
