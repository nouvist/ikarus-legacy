import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from "electron";
import { EventKey, EventMap } from "~/main/bridge/types";
export * from "~/main/bridge/types";

export default function createMainBridge(window: BrowserWindow) {
  return {
    addEventListener<Key extends EventKey, Type extends EventMap[Key]>(
      key: Key,
      callback: (event: IpcMainEvent, args: Type["fromRenderer"]) => void,
    ) {
      return ipcMain.addListener(key, callback);
    },
    removeEventListener<Key extends EventKey>(key: Key, callback: () => void) {
      return ipcMain.removeListener(key, callback);
    },
    emit<Key extends EventKey, Type extends EventMap[Key]>(
      key: Key,
      value: Type["fromMain"],
    ) {
      return window.webContents.send(key, value);
    },
    handle<Key extends EventKey, Type extends EventMap[Key]>(
      key: Key,
      callback: (
        event: IpcMainInvokeEvent,
        args: Type["fromRenderer"],
      ) => Promise<Type["fromMain"]>,
    ) {
      return ipcMain.handle(key, callback);
    },
  };
}

export type MainBridge = ReturnType<typeof createMainBridge>;
