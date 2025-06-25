import { IpcMessageEvent } from "electron";
import { getRandom, RefCell } from "~/shared/core";
import { WebviewEventKey, WebviewEventMap } from "~/webview/bridge/types";

export type BrowserBridge = ReturnType<typeof createBrowserBridge>;

export default function createBrowserBridge(
  ref: RefCell<Electron.WebviewTag | undefined>
) {
  const callbacks = createCallbackMap();
  return {
    addEventListener: <
      Key extends WebviewEventKey,
      Type extends WebviewEventMap[Key],
    >(
      key: Key,
      callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void
    ) => {
      if (callbacks.has(key, callback)) return;
      ref?.value?.addEventListener(
        "ipc-message",
        callbacks.register(key, callback, (event) => {
          if (event.channel !== key) return;
          const args = event.args as Type["fromMain"];
          callback(event, args);
        })
      );
    },
    removeEventListener: <
      Key extends WebviewEventKey,
      Type extends WebviewEventMap[Key],
    >(
      key: Key,
      callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void
    ) => {
      const binding = callbacks.remove(key, callback);
      if (!binding) return;
      ref.value?.removeEventListener("ipc-message", binding);
    },
    invoke: <Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
      key: Key,
      value: Type["fromMain"],
      timeout = 10e3
    ): Promise<Type["fromRenderer"]> => {
      const random = getRandom();
      return new Promise((resolve, reject) => {
        function handle(event: IpcMessageEvent) {
          const isResolved = event.channel === "__Invoke::resolve";
          const isRejected = event.channel === "__Invoke::reject";
          if (!isResolved && !isRejected) return;

          const [id, channel, result] = event.args;
          if (id !== random) return;
          if (channel !== key) return;
          ref.value?.removeEventListener("ipc-message", handle);

          if (isResolved) resolve(result);
          else if (isRejected) reject(result);
        }
        ref.value?.addEventListener("ipc-message", handle);
        setTimeout(() => {
          ref.value?.removeEventListener("ipc-message", handle);
          reject(new Error(`Timeout invoking ${key}`));
        }, timeout);
        ref.value?.send("__Invoke::call", [random, key, value]);
      });
    },
  };
}

function createCallbackMap() {
  const map = {} as Record<
    WebviewEventKey,
    {
      callback: (event: IpcMessageEvent, args: any) => void;
      binding: (event: IpcMessageEvent) => void;
    }[]
  >;

  return {
    has: <Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
      key: Key,
      callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void
    ) => {
      return !!map[key]?.some((item) => item.callback === callback);
    },
    register: <Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
      key: Key,
      callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void,
      binding: (event: IpcMessageEvent) => void
    ) => {
      if (!map[key]) map[key] = [];
      map[key].push({ callback, binding });
      return binding;
    },
    remove: <Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
      key: Key,
      callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void
    ) => {
      if (!map[key]) return;
      const index = map[key].findIndex((item) => item.callback === callback);
      if (index === -1) return;
      const [item] = map[key].splice(index, 1);
      return item.binding;
    },
  };
}
