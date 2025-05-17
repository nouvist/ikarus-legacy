import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("API", {
  hello: () => "hello from preload",
});
