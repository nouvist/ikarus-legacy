import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("API", {
  hello: () => "hello from preload",
});
