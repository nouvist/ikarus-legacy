import path from "path";
import url from "url";

export default function createWebviewManaged() {
  return {
    preload: url
      .pathToFileURL(path.join(__dirname, "webview_preload.js"))
      .toString(),
  };
}
