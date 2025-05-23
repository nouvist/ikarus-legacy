import { nativeTheme, systemPreferences } from "electron";
import { MainBridge, ThemeEvent } from "~/main/bridge";

export default function createThemeService(ipc: MainBridge) {
  let last: ThemeEvent = {
    accentColor: systemPreferences.getAccentColor(),
    isDark: nativeTheme.shouldUseDarkColors,
  };

  function emit() {
    ipc.emit("Theme::changed", last);
  }

  ipc.handle("Theme::changed", async () => last);

  systemPreferences.addListener("accent-color-changed", (_, color) => {
    if (color === last.accentColor) return;
    last.accentColor = color;
    emit();
  });

  nativeTheme.addListener("updated", () => {
    if (nativeTheme.shouldUseDarkColors === last.isDark) return;
    last.isDark = nativeTheme.shouldUseDarkColors;
    emit();
  });
}
