import BrowserController from "~/renderer/components/browser/controller/controller";
import { HtmlUtils } from "~/shared/html";

export default class BrowserControllerImpl extends BrowserController {
  constructor() {
    super();
    this.url = this.url.bind(this);
    this.title = this.title.bind(this);
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

  url() {
    if (this.isNotBound) return "";
    return this._ref.value.src;
  }

  title() {
    if (this.isNotBound) return undefined;
    if (this.url() === "") return undefined;
    return this.js(() => document.title);
  }

  debug() {
    if (this.isNotBound) return "";
    this._ref.value.openDevTools();
  }

  async go(src: string) {
    if (!src.startsWith("http") && !src.startsWith("https://")) {
      src = `https://${src}`;
    }

    await this.waitUntilBound();
    this._ref.value.src = src;

    await this.waitUntilReady();
  }

  goBack() {
    if (this.isNotBound) return;
    if (!this._ref.value.canGoBack()) return;
    this._ref.value.goBack();
    return this.waitUntilReady();
  }

  goForward() {
    if (this.isNotBound) return;
    if (!this._ref.value.canGoForward()) return;
    this._ref.value.goForward();
    return this.waitUntilReady();
  }

  canGoBack() {
    if (this.isNotBound) return false;
    return this._ref.value.canGoBack();
  }

  canGoForward() {
    if (this.isNotBound) return false;
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
        const id = HtmlUtils.getElementSelector(el);
        let value: any = undefined;
        if (eventType === "input" || eventType === "change") {
          value = (el as HTMLInputElement).value;
        }
        await this.js(
          ({ id, eventType, value }) => {
            const element = document.querySelector(id);
            if (!element) return;
            if (eventType === "click") (element as HTMLElement).click();
            if (
              (eventType === "input" || eventType === "change") &&
              "value" in element
            )
              (element as HTMLInputElement).value = value;
            const event = new Event(eventType, {
              bubbles: true,
              cancelable: true,
            });
            element?.dispatchEvent(event);
          },
          { id, eventType, value }
        );
      });
    }

    return dom;
  }

  async isElementVisible(element: Element | string) {
    if (typeof element !== "string") {
      element = HtmlUtils.getElementSelector(element);
    }

    return this.js((selector: string) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return false;
      if (element.tagName === "SCRIPT") return false;
      if (element.tagName === "STYLE") return false;
      if (element.style.visibility === "hidden") return false;
      if (element.style.display === "none") return false;
      return true;
    }, element);
  }

  async waitUntilReady() {
    await this.waitUntilBound();

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
