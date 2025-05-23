import { BrowserWindow } from "electron";
import { MainBridge } from "~/main/bridge";

export default function createWindowService(
  window: BrowserWindow,
  bridge: MainBridge
) {
  bridge.handle("Window::close", async () => {
    window.close();
  });

  bridge.handle("Window::minimize", async () => {
    window.minimize();
  });

  bridge.handle("Window::maximize", async () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

  bridge.handle("Window::show", async () => {
    window.show();
  });

  bridge.handle("Window::hide", async () => {
    window.hide();
  });
}
