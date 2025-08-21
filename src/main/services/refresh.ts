import { BrowserWindow } from "electron";

export default class RefreshService {
  protected _window: BrowserWindow;
  protected _enabled: boolean;

  constructor(window: BrowserWindow, enabled: boolean = true) {
    this._window = window;
    this._enabled = enabled;
    this._handleInput = this._handleInput.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);

    if (enabled) this.enable();
    else this.disable();
  }

  get isEnabled() {
    return this._enabled;
  }

  protected _handleInput(event: Electron.Event, input: Electron.Input) {
    const disabledKeys = [
      input.control && input.code === "KeyR",
      input.code === "F5",
    ];
    if (disabledKeys.some(Boolean)) event.preventDefault();
  }

  enable() {
    this._enabled = true;
    this._window.webContents.on("before-input-event", this._handleInput);
  }

  disable() {
    this._enabled = false;
    this._window.webContents.off("before-input-event", this._handleInput);
  }
}
