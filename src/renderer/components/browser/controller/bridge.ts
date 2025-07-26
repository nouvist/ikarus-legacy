import { IpcMessageEvent } from "electron";
import { Completer, getRandom, RefCell } from "~/shared/core";
import { WebviewEventKey, WebviewEventMap } from "~/webview/bridge/types";

export default class BrowserBridge {
  protected _ref: RefCell<Electron.WebviewTag | undefined>;
  protected _callbacks = new _CallbackMap();

  constructor(ref: RefCell<Electron.WebviewTag | undefined>) {
    this._ref = ref;
    this.invoke = this.invoke.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
  }

  protected get _raw() {
    return this._ref.value!;
  }

  addEventListener<
    Key extends WebviewEventKey,
    Type extends WebviewEventMap[Key],
  >(
    key: Key,
    callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void
  ) {
    if (this._callbacks.has(key, callback)) return;
    this._raw.addEventListener(
      "ipc-message",
      this._callbacks.register(key, callback, (event) => {
        if (event.channel !== key) return;
        const args = event.args as Type["fromMain"];
        callback(event, args);
      })
    );
  }

  removeEventListener<
    Key extends WebviewEventKey,
    Type extends WebviewEventMap[Key],
  >(
    key: Key,
    callback: (event: IpcMessageEvent, args: Type["fromMain"]) => void
  ) {
    const binding = this._callbacks.remove(key, callback);
    if (!binding) return;
    this._raw.removeEventListener("ipc-message", binding);
  }

  invoke<Key extends WebviewEventKey, Type extends WebviewEventMap[Key]>(
    key: Key,
    value: Type["fromMain"],
    timeout?: number
  ): Promise<Type["fromRenderer"]> {
    const random = getRandom();
    const raw = this._raw;
    const completer = new Completer<Type["fromRenderer"]>();

    function handle(event: IpcMessageEvent) {
      const isResolved = event.channel === "__Invoke::resolve";
      const isRejected = event.channel === "__Invoke::reject";
      if (!isResolved && !isRejected) return;
      const [id, channel, result] = event.args;
      if (id !== random) return;
      if (channel !== key) return;
      raw.removeEventListener("ipc-message", handle);
      if (isResolved) completer.resolve(result);
      else if (isRejected) completer.reject(result);
    }

    raw.addEventListener("ipc-message", handle);
    if (timeout) {
      setTimeout(() => {
        raw.removeEventListener("ipc-message", handle);
        completer.reject(new Error(`Timeout invoking ${key}`));
      }, timeout);
    }

    raw.send("__Invoke::call", [random, key, value]);
    return completer.wait();
  }
}

class _CallbackMap {
  protected _map = {} as Record<
    WebviewEventKey,
    {
      callback: (event: IpcMessageEvent, args: any) => void;
      binding: (event: IpcMessageEvent) => void;
    }[]
  >;

  constructor() {
    this.has = this.has.bind(this);
    this.register = this.register.bind(this);
    this.remove = this.remove.bind(this);
  }

  has<Key extends WebviewEventKey>(
    key: Key,
    callback: (event: IpcMessageEvent, args: any) => void
  ) {
    return !!this._map[key]?.some((item) => item.callback === callback);
  }

  register<Key extends WebviewEventKey>(
    key: Key,
    callback: (event: IpcMessageEvent, args: any) => void,
    binding: (event: IpcMessageEvent) => void
  ) {
    if (!this._map[key]) this._map[key] = [];
    this._map[key].push({ callback, binding });
    return binding;
  }

  remove<Key extends WebviewEventKey>(
    key: Key,
    callback: (event: IpcMessageEvent, args: any) => void
  ) {
    if (!this._map[key]) return;
    const index = this._map[key].findIndex(
      (item) => item.callback === callback
    );
    if (index === -1) return;
    const [item] = this._map[key].splice(index, 1);
    return item.binding;
  }
}
