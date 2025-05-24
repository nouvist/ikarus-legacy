import { BrowserWindow } from "electron";
import { MainBridge } from "~/main/bridge";
import createRef from "~/shared/ref";

export default function createWindowService(
  window: BrowserWindow,
  bridge: MainBridge
) {
  const isShown = createRef(false);

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
    isShown.value = true;
  });

  bridge.handle("Window::hide", async () => {
    window.hide();
    isShown.value = false;
  });

  return {
    get isShown() {
      return isShown.value;
    },
  };
}
