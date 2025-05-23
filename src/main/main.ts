import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import path from "node:path";
import { createMainBridge } from "~/main/bridge";
import createThemeService from "~/main/services/theme";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    frame: false,
    roundedCorners: true,
    fullscreenable: false,
    backgroundMaterial: "mica",
    webPreferences: {
      devTools: !!MAIN_WINDOW_VITE_DEV_SERVER_URL,
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  win.webContents.on("before-input-event", (event, input) => {
    const disabledKeys = [
      input.control && input.code === "KeyR",
      input.code === "F5",
    ];

    if (disabledKeys.some(Boolean)) event.preventDefault();
  });

  const ipc = createMainBridge(win);
  createThemeService(ipc);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
