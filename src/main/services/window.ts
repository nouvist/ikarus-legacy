import { BrowserWindow } from "electron";
import MainBridge from "~/main/bridge";

export default class WindowService {
  protected _bridge: MainBridge;
  protected _window: BrowserWindow;

  protected _isShown = false;

  constructor(window: BrowserWindow, bridge: MainBridge) {
    this._window = window;
    this._bridge = bridge;

    this._bridge.handle("Window::close", async () => {
      this._window.close();
    });

    this._bridge.handle("Window::minimize", async () => {
      this._window.minimize();
    });

    this._bridge.handle("Window::maximize", async () => {
      if (this._window.isMaximized()) {
        this._window.unmaximize();
      } else {
        this._window.maximize();
      }
    });

    this._bridge.handle("Window::show", async () => {
      this._window.show();
      this._isShown = true;
    });

    this._bridge.handle("Window::hide", async () => {
      this._window.hide();
      this._isShown = false;
    });

    this._bridge.handle("Window::setTitleBarColor", async (_, color) => {
      this._window.setTitleBarOverlay({
        color,
      });
    });

    this._bridge.handle("Window::debug", async () => {
      this._window.webContents.openDevTools();
    });
  }

  get isShown() {
    return this._isShown;
  }
}
