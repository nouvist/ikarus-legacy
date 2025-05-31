import { WebviewBridge } from "~/webview/bridge";

export default function createJsService(bridge: WebviewBridge) {
  bridge.handle("Js::eval", (_, args) => eval(args));
}
