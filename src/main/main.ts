import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import path from "node:path";
import createMainBridge from "~/main/bridge";
import createThemeService from "~/main/services/theme";
import createWindowService from "~/main/services/window";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

function createWindow() {
  const window = new BrowserWindow({
    // frame: false,
    show: false,
    roundedCorners: true,
    fullscreenable: false,
    // backgroundMaterial: "mica",
    backgroundColor: "#00000000",
    frame: false, // Remove the entire native frame (titlebar + controls)
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#ffffff",
      height: 48,
    },
    titleBarStyle: "hidden", // macOS-specific - hides the native titlebar but keeps traffic lights

    webPreferences: {
      devTools: !!MAIN_WINDOW_VITE_DEV_SERVER_URL,
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  window.removeMenu();

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    window.webContents.openDevTools();
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  window.webContents.on("before-input-event", (event, input) => {
    const disabledKeys = [
      input.control && input.code === "KeyR",
      input.code === "F5",
    ];

    if (disabledKeys.some(Boolean)) event.preventDefault();
  });

  const bridge = createMainBridge(window);
  createWindowService(window, bridge);
  createThemeService(bridge);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
