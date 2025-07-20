import { contextBridge } from "electron";
import RendererBridge from "~/preload/services/bridge";
import EnvManaged from "~/preload/services/env";
import PlatformManaged from "~/preload/services/platform";
import WebviewManaged from "~/preload/services/webview";
import WindowManaged from "~/preload/services/window";

export default class Managed {
  protected _bridge: RendererBridge;
  readonly env: EnvManaged;
  readonly platform: PlatformManaged;
  readonly window: WindowManaged;
  readonly webview: WebviewManaged;

  constructor() {
    this._bridge = new RendererBridge();
    this.env = new EnvManaged(this._bridge);
    this.platform = new PlatformManaged();
    this.window = new WindowManaged(this._bridge);
    this.webview = new WebviewManaged();
  }

  expose() {
    try {
      contextBridge.exposeInMainWorld("Managed", Managed);
      contextBridge.exposeInMainWorld("managed", this);
    } catch {
      Object.defineProperties(window, {
        Managed: {
          value: Managed,
          writable: false,
        },
        managed: {
          value: this,
          writable: false,
        },
      });
    }
  }
}

const managed = new Managed();
managed.expose();

declare global {
  const Managed: typeof managed;
  const managed: Managed;
}
