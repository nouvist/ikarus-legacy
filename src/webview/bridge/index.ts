import { ipcRenderer, IpcRendererEvent } from "electron";
import { WebviewEventKey, WebviewEventMap } from "~/webview/bridge/types";

export interface WebviewService {
  register: (bridge: WebviewBridge) => void;
}

export default class WebviewBridge {
  constructor() {
    this.register = this.register.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.emit = this.emit.bind(this);
    this.handle = this.handle.bind(this);
  }

  register(service: WebviewService) {
    service.register(this);
    return service;
  }

  addEventListener<
    Key extends WebviewEventKey,
    Type extends WebviewEventMap[Key],
  >(
    key: Key,
    callback: (event: IpcRendererEvent, args: Type["fromRenderer"]) => void
  ) {
    return ipcRenderer.addListener(key, callback);
  }

  removeEventListener<Key extends WebviewEventKey>(
    key: Key,
    callback: () => void
  ) {
    return ipcRenderer.removeListener(key, callback);
  }

  emit<Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
    key: Key,
    value: Type["fromMain"]
  ) {
    return ipcRenderer.sendToHost(key, value);
  }

  handle<Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
    key: Key,
    callback: (
      event: IpcRendererEvent,
      args: Type["fromRenderer"]
    ) => Promise<Type["fromMain"]>
  ) {
    ipcRenderer.addListener("__Invoke::call", async (event, args) => {
      if (args.length !== 3) return;
      const [id, channel, value] = args;
      if (channel !== key) return;
      try {
        const result = await callback(event, value);
        ipcRenderer.sendToHost("__Invoke::resolve", id, channel, result);
      } catch (error) {
        ipcRenderer.sendToHost("__Invoke::reject", id, channel, error);
      }
    });
  }
}
