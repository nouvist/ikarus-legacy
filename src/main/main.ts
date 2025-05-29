import { app, BrowserWindow, dialog } from "electron";
import squirrel from "electron-squirrel-startup";
import path from "node:path";
import createMainBridge from "~/main/bridge";
import createRefreshService from "~/main/services/refresh";
import createWindowService from "~/main/services/window";

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
  const window = new BrowserWindow({
    show: false,
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
      devTools: !!MAIN_WINDOW_VITE_DEV_SERVER_URL,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
    },
  });

  const bridge = createMainBridge(window);
  const winsvc = createWindowService(window, bridge);
  createRefreshService(window, !!MAIN_WINDOW_VITE_DEV_SERVER_URL);

  setTimeout(async () => {
    if (winsvc.isShown) return;
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) return;
    await dialog.showMessageBox(window, {
      title: "Not responding",
      message: "App is not responding, failsafe triggered.",
    });
    window.close();
  }, 5e3);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(
      path.join(__dirname, "../renderer", `${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}
