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
    this._handleDebugKeydown = this._handleDebugKeydown.bind(this);
    this._exposeDebug = this._exposeDebug.bind(this);

    this._exposeDebug();
  }

  protected static _lastHandleDebugKeydown?: (e: KeyboardEvent) => void;

  protected _handleDebugKeydown(e: KeyboardEvent) {
    if (this._ref.isUninitialized) return;
    if (!e.ctrlKey) return;
    if (!e.shiftKey) return;
    if (e.code !== "KeyO") return;
    this._ref.value.openDevTools();
  }

  protected async _exposeDebug() {
    if (!(await managed.env.isDebug())) return;

    if (BrowserController._lastHandleDebugKeydown) {
      window.removeEventListener(
        "keydown",
        BrowserController._lastHandleDebugKeydown
      );
    }

    BrowserController._lastHandleDebugKeydown = this._handleDebugKeydown;
    window.addEventListener("keydown", this._handleDebugKeydown);

    Object.assign(window, {
      BrowserController: BrowserController,
      browser: this,
    });
  }

  get raw() {
    return this._ref.value;
  }

  get isBound() {
    if (this._ref.isUninitialized) return false;
    return this._completer.isResolved;
  }

  get isNotBound() {
    return !this.isBound;
  }

  bind(wv: WebviewTag) {
    this._ref.value = wv;
    this._completer.resolve();
  }

  waitUntilBound() {
    return this._completer.wait();
  }
}
