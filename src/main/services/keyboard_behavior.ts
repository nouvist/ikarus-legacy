import { BrowserWindow } from "electron";

export default class KeyboardBehaviorService {
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
      // refresh
      input.code === "F5",
      input.control && input.code === "KeyR",

      // zoom
      input.control && input.code === "Minus",
      input.control && input.shift && input.code === "Equal",
    ];
    if (disabledKeys.some(Boolean)) event.preventDefault();
  }

  enable() {
    this._enabled = true;
    this._window.webContents.off("before-input-event", this._handleInput);
  }

  disable() {
    this._enabled = false;
    this._window.webContents.on("before-input-event", this._handleInput);
  }
}
