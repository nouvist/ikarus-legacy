import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from "electron";
import { EventKey, EventMap } from "~/main/bridge/types";
export * from "~/main/bridge/types";

export default class MainBridge {
  protected _window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this._window = window;
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.emit = this.emit.bind(this);
    this.handle = this.handle.bind(this);
  }

  addEventListener<Key extends EventKey, Type extends EventMap[Key]>(
    key: Key,
    callback: (event: IpcMainEvent, args: Type["fromRenderer"]) => void
  ) {
    return ipcMain.addListener(key, callback);
  }

  removeEventListener<Key extends EventKey>(key: Key, callback: () => void) {
    return ipcMain.removeListener(key, callback);
  }

  emit<Key extends EventKey, Type extends EventMap[Key]>(
    key: Key,
    value: Type["fromMain"]
  ) {
    return this._window.webContents.send(key, value);
  }

  handle<Key extends EventKey, Type extends EventMap[Key]>(
    key: Key,
    callback: (
      event: IpcMainInvokeEvent,
      args: Type["fromRenderer"]
    ) => Promise<Type["fromMain"]>
  ) {
    return ipcMain.handle(key, callback);
  }
}
