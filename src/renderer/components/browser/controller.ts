import { WebviewTag } from "electron";
import { useRef } from "react";
import BrowserBridge from "~/renderer/components/browser/bridge";
import BrowserManaged from "~/renderer/components/browser/managed";
import { createCompleter, createRefCell } from "~/shared/core";

export function useBrowserController() {
  const ref = useRef<BrowserController>(null);
  return (ref.current ??= new BrowserController());
}

export class BrowserController {
  protected _completer = createCompleter<void>();
  protected _ref = createRefCell<WebviewTag | undefined>(undefined);
  protected _bridge = new BrowserBridge(this._ref);
  readonly managed = new BrowserManaged(
    this._ref,
    this._bridge,
    this._completer.wait,
  );

  constructor() {
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.bind = this.bind.bind(this);
  }

  get raw() {
    return this._ref.value!;
  }

  waitUntilReady() {
    return this._completer.wait();
  }

  bind(wv: WebviewTag) {
    this._ref.value = wv;
    this._completer.resolve();
  }
}
