import { ThemeEvent } from "~/main/bridge/types";
import bridge from "~/renderer/preload/bridge";
import { EventEmitter } from "events";

export default function createTheme() {
  const ref: { value: ThemeEvent | undefined } = { value: undefined };
  const event = new EventEmitter();

  const promise = bridge
    .invoke("istn::theme-changed", undefined)
    .then((value) => (ref.value = value));

  bridge.addEventListener("istn::theme-changed", (_, args) => {
    ref.value = args;
    event.emit("refresh");
  });

  return {
    async waitUntilReady() {
      await promise;
    },
    addListener(callback: () => void) {
      return event.addListener('refresh', callback);
    },
    removeListener(callback: () => void) {
      return event.removeListener('refresh', callback);
    },
    getAccentColor() {
      return ref.value?.accentColor;
    },
    getIsDark() {
      return ref.value?.isDark;
    },
  };
}
