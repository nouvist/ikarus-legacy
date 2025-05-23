import { BrowserWindow } from "electron";

export default function createRefreshService(
  window: BrowserWindow,
  disable: boolean
) {
  if (!disable) return;
  window.webContents.on("before-input-event", (event, input) => {
    const disabledKeys = [
      input.control && input.code === "KeyR",
      input.code === "F5",
    ];
    if (disabledKeys.some(Boolean)) event.preventDefault();
  });
}
