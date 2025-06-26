import { BrowserBridge } from "~/renderer/components/browser/bridge";
import { RefCell } from "~/shared/core";
import { getSelector } from "~/shared/html";

export default function createBrowserManaged(
  ref: RefCell<Electron.WebviewTag | undefined>,
  bridge: BrowserBridge,
  wait: () => Promise<void>,
) {
  function debug() {
    ref.value?.openDevTools();
  }

  async function go(src: string) {
    await wait();
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

  function canGoBack() {
    return ref.value?.canGoBack() ?? false;
  }

  function canGoForward() {
    return ref.value?.canGoForward() ?? false;
  }

  function js<T, O extends { [k: string]: any } | undefined>(
    callback: (obj: O) => T,
    obj?: O,
  ) {
    return bridge.invoke(
      "Js::eval",
      `(${callback.toString()})(${JSON.stringify(obj)});`,
    ) as Promise<T>;
  }

  async function dom() {
    const html = await js(() => document.documentElement.outerHTML);
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
        await js(
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
          { id, eventType, value },
        );
      });
    }

    return document;
  }

  return {
    debug,
    go,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    js,
    dom,
  };
}
