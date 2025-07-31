import { WebviewTag } from "electron";
import BrowserBridge from "~/renderer/components/browser/controller/bridge";
import { Completer, LateRefCell } from "~/shared/core";

export default class BrowserController {
  protected _ref = new LateRefCell<WebviewTag>();
  protected _bridge = new BrowserBridge(this._ref);
  protected _completer = new Completer();

  constructor() {
    this.bind = this.bind.bind(this);
    this.waitUntilBound = this.waitUntilBound.bind(this);
  }

  get raw() {
    return this._ref.value;
  }

  bind(wv: WebviewTag) {
    this._ref.value = wv;
    this._completer.resolve();
  }

  waitUntilBound() {
    return this._completer.wait();
  }
}
