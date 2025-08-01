import { ipcRenderer, IpcRendererEvent } from "electron";
import { EventKey, EventMap } from "~/main/bridge/types";

export default class RendererBridge {
  constructor() {
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.emit = this.emit.bind(this);
    this.invoke = this.invoke.bind(this);
  }

  addEventListener<Key extends EventKey, Type extends EventMap[Key]>(
    key: Key,
    callback: (event: IpcRendererEvent, args: Type["fromMain"]) => void
  ) {
    return ipcRenderer.addListener(key, callback);
  }

  removeEventListener<Key extends EventKey>(key: Key, callback: () => void) {
    return ipcRenderer.removeListener(key, callback);
  }

  emit<Key extends EventKey, Type extends EventMap[Key]>(
    key: Key,
    value: Type["fromRenderer"]
  ) {
    return ipcRenderer.emit(key, value);
  }

  invoke<Key extends EventKey, Type extends EventMap[Key]>(
    key: Key,
    args: Type["fromRenderer"] = undefined
  ): Promise<Type["fromMain"]> {
    return ipcRenderer.invoke(key, args);
  }
}
