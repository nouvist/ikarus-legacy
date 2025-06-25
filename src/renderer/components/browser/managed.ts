import { BrowserBridge } from "~/renderer/components/browser/bridge";
import { RefCell } from "~/shared/core";

export default function createBrowserManaged(
  ref: RefCell<Electron.WebviewTag | undefined>,
  bridge: BrowserBridge,
  promise: Promise<void>
) {
  function debug() {
    ref.value?.openDevTools();
  }

  async function go(src: string) {
    await promise;
    ref.value!.src = src;
  }

  function goBack() {
    if (!ref.value?.canGoBack()) return;
    ref.value.goBack();
  }

  function goForward() {
    if (!ref.value?.canGoForward()) return;
    ref.value.goForward();
  }

  function js<T>(callback: () => T) {
    return bridge.invoke(
      "Js::eval",
      `(${callback.toString()})()`
    ) as Promise<T>;
  }

  async function dom() {
    const html = await js(() => document.documentElement.outerHTML);
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    return document;
  }

  return {
    debug,
    go,
    goBack,
    goForward,
    js,
    dom,
  };
}
