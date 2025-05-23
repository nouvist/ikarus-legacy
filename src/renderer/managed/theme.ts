import { EventEmitter } from "events";
import { ThemeEvent } from "~/main/bridge/types";
import { RendererBridge } from "~/renderer/managed/bridge";

export default function createThemeManaged(bridge: RendererBridge) {
  const ref: { value: ThemeEvent | undefined } = { value: undefined };
  const event = new EventEmitter();

  const promise = bridge
    .invoke("Theme::changed", undefined)
    .then((value) => (ref.value = value));

  bridge.addEventListener("Theme::changed", (_, args) => {
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
