import { WebviewTag } from "electron";
import { useRef } from "react";
import BrowserBridge from "~/renderer/components/browser/controller/bridge";
import BrowserManaged from "~/renderer/components/browser/controller/managed";
import { Completer, LateRefCell } from "~/shared/core";

export function useBrowserController() {
  const ref = useRef<BrowserController>(null);
  return (ref.current ??= new BrowserController());
}

export class BrowserController {
  protected _ref = new LateRefCell<WebviewTag>();
  protected _bridge = new BrowserBridge(this._ref);
  protected _completer = new Completer();

  readonly managed = new BrowserManaged(
    this._ref,
    this._bridge,
    this._completer.wait
  );

  constructor() {
    this.waitUntilBound = this.waitUntilBound.bind(this);
    this.bind = this.bind.bind(this);
  }

  get raw() {
    return this._ref.value;
  }

  waitUntilBound() {
    return this._completer.wait();
  }

  bind(wv: WebviewTag) {
    this._ref.value = wv;
    this._completer.resolve();
  }
}
