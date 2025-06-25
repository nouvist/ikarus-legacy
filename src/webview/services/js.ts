import { WebviewBridge } from "~/webview/bridge";

export default function createJsService(bridge: WebviewBridge) {
  // oxlint-disable-next-line no-eval
  bridge.handle("Js::eval", (_, args) => eval(args));
}
