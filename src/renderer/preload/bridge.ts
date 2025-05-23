import { ipcRenderer, IpcRendererEvent } from "electron";
import { EventKey, EventMap } from "~/main/bridge/types";

function createRendererBridge() {
  return {
    addEventListener<Key extends EventKey, Type extends EventMap[Key]>(
      key: Key,
      callback: (event: IpcRendererEvent, args: Type["fromMain"]) => void
    ) {
      return ipcRenderer.addListener(key, callback);
    },
    removeEventListener<Key extends EventKey>(key: Key, callback: () => void) {
      return ipcRenderer.removeListener(key, callback);
    },
    emit<Key extends EventKey, Type extends EventMap[Key]>(
      key: Key,
      value: Type["fromRenderer"]
    ) {
      return ipcRenderer.emit(key, value);
    },
    invoke<Key extends EventKey, Type extends EventMap[Key]>(
      key: Key,
      args: Type["fromRenderer"]
    ): Promise<Type["fromMain"]> {
      return ipcRenderer.invoke(key, args);
    },
  };
}

const bridge = createRendererBridge();
export default bridge;
