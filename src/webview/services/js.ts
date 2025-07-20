import { IpcRendererEvent } from "electron";
import WebviewBridge, { WebviewService } from "~/webview/bridge";

export default class JsService implements WebviewService {
  protected _bridge: WebviewBridge | undefined;

  constructor() {
    this._handleEval = this._handleEval.bind(this);
    this.register = this.register.bind(this);
  }

  protected async _handleEval(_event: IpcRendererEvent, args: string) {
    return eval(args);
  }

  register(bridge: WebviewBridge) {
    this._bridge = bridge;
    this._bridge.handle("Js::eval", this._handleEval);
  }
}
