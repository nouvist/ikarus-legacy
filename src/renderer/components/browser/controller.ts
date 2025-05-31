import { WebviewTag } from "electron";
import { useRef } from "react";
import createBrowserBridge from "~/renderer/components/browser/bridge";
import { createCompleter, createRefCell } from "~/shared/core";

export type BrowserController = ReturnType<typeof createBrowserController>;

export function useBrowserController() {
  return useRef(createBrowserController()).current;
}

export function createBrowserController() {
  const { promise, resolve } = createCompleter<void>();
  const ref = createRefCell<WebviewTag | undefined>(undefined);
  const bridge = createBrowserBridge(ref);

  return {
    bridge,
    waitUntilReady: () => promise,
    getRaw: () => ref.value,
    bind: (wv: WebviewTag) => {
      ref.value = wv;
      resolve();
    },
    debug: () => {
      ref.value?.openDevTools();
    },
    load: async (src: string) => {
      await promise;
      ref.value!.src = src;
    },
    goBack: () => {
      if (!ref.value?.canGoBack()) return;
      ref.value.goBack();
    },
    goForward: () => {
      if (!ref.value?.canGoForward()) return;
      ref.value.goForward();
    },
    eval: <T>(callback: () => T) => {
      return bridge.invoke(
        "Js::eval",
        `(${callback.toString()})()`
      ) as Promise<T>;
    },
  };
}
