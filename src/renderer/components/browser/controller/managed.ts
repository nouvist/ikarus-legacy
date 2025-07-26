import BrowserBridge from "~/renderer/components/browser/controller/bridge";
import { LateRefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

export default class BrowserManaged {
  protected _ref: LateRefCell<Electron.WebviewTag>;
  protected _bridge: BrowserBridge;
  protected _waitUntilBound: () => Promise<void>;

  constructor(
    ref: LateRefCell<Electron.WebviewTag>,
    bridge: BrowserBridge,
    wait: () => Promise<void>
  ) {
    this._ref = ref;
    this._bridge = bridge;
    this._waitUntilBound = wait;

    this.debug = this.debug.bind(this);
    this.go = this.go.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.canGoBack = this.canGoBack.bind(this);
    this.canGoForward = this.canGoForward.bind(this);
    this.js = this.js.bind(this);
    this.dom = this.dom.bind(this);
    this.waitUntilReady = this.waitUntilReady.bind(this);
  }

  debug() {
    if (this._ref.isUninitialized) return;
    this._ref.value.openDevTools();
  }

  async go(src: string) {
    if (!src.startsWith("http") && !src.startsWith("https://")) {
      src = `https://${src}`;
    }

    await this._waitUntilBound();
    this._ref.value.src = src;

    await this.waitUntilReady();
  }

  goBack() {
    if (this._ref.isUninitialized) return;
    if (!this._ref.value.canGoBack()) return;
    this._ref.value.goBack();
    return this.waitUntilReady();
  }

  goForward() {
    if (this._ref.isUninitialized) return;
    if (!this._ref.value.canGoForward()) return;
    this._ref.value.goForward();
    return this.waitUntilReady();
  }

  canGoBack() {
    if (this._ref.isUninitialized) return false;
    return this._ref.value.canGoBack();
  }

  canGoForward() {
    if (this._ref.isUninitialized) return false;
    return this._ref.value.canGoForward();
  }

  js<T, O extends Object = any>(callback: (obj: O) => T, obj?: O) {
    return this._bridge.invoke(
      "Js::eval",
      `(${callback.toString()})(${JSON.stringify(obj)});`
    ) as Promise<T>;
  }

  async dom() {
    const html = await this.js(() => document.documentElement.outerHTML);
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");

    for (const eventType of ["click", "input", "change", "keydown", "keyup"]) {
      dom.addEventListener(eventType, async (event) => {
        const el = event.target as HTMLElement;
        const id = HtmlUtils.getSelectorFromElement(el);
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

    return dom;
  }

  async waitUntilReady() {
    await this._waitUntilBound();

    try {
      this._ref.value.getWebContentsId();
    } catch {
      await new Promise((resolve) => {
        this._ref.value.addEventListener("dom-ready", resolve);
      });
    }

    await this.js(() => {
      if (document.readyState === "complete") return;
      return new Promise<void>((resolve) => {
        function handle() {
          if (document.readyState !== "complete") return;
          document.removeEventListener("readystatechange", handle);
          resolve();
        }
        document.addEventListener("readystatechange", handle);
      });
    });
  }
}
