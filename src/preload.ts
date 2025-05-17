import { contextBridge } from "electron";
import path from "node:path";

console.log("it should be loaded");
contextBridge.exposeInMainWorld("API", {
  hello: () => path.join(__dirname, "webview.js"),
});
