import { app, BrowserWindow, dialog } from "electron";
import squirrel from "electron-squirrel-startup";
import path from "node:path";
import MainBridge from "~/main/bridge";
import EnvService from "~/main/services/env";
import RefreshService from "~/main/services/refresh";
import WindowService from "~/main/services/window";

if (squirrel) app.quit();
if (!app.requestSingleInstanceLock()) app.quit();

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("second-instance", () => {
  BrowserWindow.getAllWindows()[0].focus();
});

// perilaku macos seharusnya
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });
// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });

function createWindow() {
  const isDebugMode = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;
  const window = new BrowserWindow({
    show: isDebugMode,
    roundedCorners: true,
    fullscreenable: false,
    backgroundColor: "#000000",
    minWidth: 500,
    minHeight: 400,
    frame: false,
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#ffffff",
      height: 48,
    },
    titleBarStyle: "hidden",
    webPreferences: {
      devTools: isDebugMode,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
      webviewTag: true,
    },
  });

  const bridge = new MainBridge(window);
  const winsvc = new WindowService(window, bridge);
  const refsvc = new RefreshService(window, isDebugMode);
  new EnvService(bridge);

  if (!isDebugMode) refsvc.enable();

  setTimeout(async () => {
    if (winsvc.isShown) return;
    if (isDebugMode) return;
    await dialog.showMessageBox(window, {
      title: "Not responding",
      message: "App is not responding, failsafe triggered.",
    });
    window.close();
  }, 5e3);

  if (isDebugMode) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(
      path.join(__dirname, "../renderer", `${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}
