import { WebviewTag } from "electron";
import { useRef } from "react";
import createBrowserBridge from "~/renderer/components/browser/bridge";
import createBrowserManaged from "~/renderer/components/browser/managed";
import { createCompleter, createRefCell } from "~/shared/core";

export type BrowserController = ReturnType<typeof createBrowserController>;

export function useBrowserController() {
  return useRef(createBrowserController()).current;
}

export function createBrowserController() {
  const { promise, resolve } = createCompleter<void>();
  const ref = createRefCell<WebviewTag | undefined>(undefined);
  const bridge = createBrowserBridge(ref);
  const managed = createBrowserManaged(ref, bridge, promise);

  return {
    bridge,
    managed,
    waitUntilReady: () => promise,
    raw: () => ref.value,
    bind: (wv: WebviewTag) => {
      ref.value = wv;
      resolve();
    },
  };
}
