import BrowserBridge from "~/renderer/components/browser/bridge";
import { RefCell } from "~/shared/core";
import { getSelector } from "~/shared/html";

export default class BrowserManaged {
  protected _ref: RefCell<Electron.WebviewTag | undefined>;
  protected _bridge: BrowserBridge;
  protected _wait: () => Promise<void>;

  constructor(
    ref: RefCell<Electron.WebviewTag | undefined>,
    bridge: BrowserBridge,
    wait: () => Promise<void>
  ) {
    this._ref = ref;
    this._bridge = bridge;
    this._wait = wait;
    this.debug = this.debug.bind(this);
    this.go = this.go.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.canGoBack = this.canGoBack.bind(this);
    this.canGoForward = this.canGoForward.bind(this);
    this.js = this.js.bind(this);
    this.dom = this.dom.bind(this);
  }

  debug() {
    this._ref.value?.openDevTools();
  }

  async go(src: string) {
    await this._wait();
    this._ref.value!.src = src;
  }

  goBack() {
    if (!this._ref.value?.canGoBack()) return;
    this._ref.value.goBack();
  }

  goForward() {
    if (!this._ref.value?.canGoForward()) return;
    this._ref.value.goForward();
  }

  canGoBack() {
    return this._ref.value?.canGoBack() ?? false;
  }

  canGoForward() {
    return this._ref.value?.canGoForward() ?? false;
  }

  js<T, O extends Object = any>(
    callback: (obj: O) => T,
    obj?: O
  ) {
    return this._bridge.invoke(
      "Js::eval",
      `(${callback.toString()})(${JSON.stringify(obj)});`
    ) as Promise<T>;
  }

  async dom() {
    const html = await this.js(() => document.documentElement.outerHTML);
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    for (const eventType of ["click", "input", "change", "keydown", "keyup"]) {
      document.addEventListener(eventType, async (event) => {
        const el = event.target as HTMLElement;
        const id = getSelector(el);
        let value: any = undefined;
        if (eventType === "input" || eventType === "change") {
          value = (el as HTMLInputElement).value;
        }
        await this.js(
          ({ id, eventType, value }) => {
            const element = document.querySelector(id);
            if (element) {
              if (eventType === "click") (element as HTMLElement).click();
              if (
                (eventType === "input" || eventType === "change") &&
                "value" in element
              )
                (element as HTMLInputElement).value = value;
            }
          },
          { id, eventType, value }
        );
      });
    }

    return document;
  }
}
