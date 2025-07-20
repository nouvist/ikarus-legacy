import path from "path";
import url from "url";

export default class WebviewManaged {
  readonly preload = url
    .pathToFileURL(path.join(__dirname, "webview_preload.js"))
    .toString();
}
