import { WebviewTag } from "electron";
import { useRef } from "react";
import createBrowserBridge from "~/renderer/components/browser/bridge";
import createBrowserManaged from "~/renderer/components/browser/managed";
import { createCompleter, createRefCell } from "~/shared/core";

export type BrowserController = ReturnType<typeof createBrowserController>;

export function useBrowserController() {
  const ref = useRef<BrowserController>(null);
  return (ref.current ??= createBrowserController());
}

export function createBrowserController() {
  const { wait, resolve } = createCompleter<void>();
  const ref = createRefCell<WebviewTag | undefined>(undefined);
  const bridge = createBrowserBridge(ref);
  const managed = createBrowserManaged(ref, bridge, wait);

  return {
    bridge,
    managed,
    waitUntilReady: wait,
    raw: () => ref.value,
    bind: (wv: WebviewTag) => {
      ref.value = wv;
      resolve();
    },
  };
}
