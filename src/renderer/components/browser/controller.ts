import { WebviewTag } from "electron";
import { useRef } from "react";
import createBrowserBridge from "~/renderer/components/browser/bridge";
import createBrowserManaged from "~/renderer/components/browser/managed";
import { createCompleter, createRefCell } from "~/shared/core";

export function useBrowserController() {
  const ref = useRef<BrowserController>(null);
  return (ref.current ??= new BrowserController());
}

export class BrowserController {
  protected _completer = createCompleter<void>();
  protected _ref = createRefCell<WebviewTag | undefined>(undefined);
  protected _bridge = createBrowserBridge(this._ref);
  protected _managed = createBrowserManaged(
    this._ref,
    this._bridge,
    this.waitUntilReady()
  );

  constructor() {
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.raw = this.raw.bind(this);
    this.bind = this.bind.bind(this);
  }

  get bridge() {
    return this._bridge;
  }

  get managed() {
    return this._managed;
  }

  waitUntilReady() {
    return this._completer.wait;
  }

  raw() {
    return this._ref.value;
  }

  bind(wv: WebviewTag) {
    this._ref.value = wv;
    this._completer.resolve();
  }
}
