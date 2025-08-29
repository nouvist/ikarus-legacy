import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  nativeTheme,
} from "electron";
import squirrel from "electron-squirrel-startup";
import path from "node:path";
import MainBridge from "~/main/bridge";
import EnvService from "~/main/services/env";
import KeyboardBehaviorService from "~/main/services/keyboard_behavior";
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

async function createWindow() {
  const isDebugMode = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;
  const isProfileMode = ["true", "on", "1"].includes(
    (process.env["PROFILE"] ?? process.env["PROFILE_MODE"] ?? "false")
      .toLowerCase()
      .trim()
  );

  if (isProfileMode && !isDebugMode) {
    console.warn("[Main::createWindow] mode profile nyala jir wkwkwk");
  }

  const window = new BrowserWindow(
    createOptions({
      isDebugMode,
      isProfileMode,
    })
  );

  const bridge = new MainBridge(window);
  new WindowService(window, bridge);
  new EnvService(bridge, isDebugMode, isProfileMode);
  new KeyboardBehaviorService(window, isDebugMode || isProfileMode);

  if (isProfileMode && !isDebugMode) {
    window.webContents.openDevTools({ mode: "detach" });
  }

  if (isDebugMode) {
    await window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await window.loadFile(
      path.join(__dirname, "../renderer", `${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  window.webContents.setZoomLevel(0);
  setTimeout(() => {
    window.show();
  }, 5e3);
}

function createOptions({
  isDebugMode,
  isProfileMode,
}: {
  isDebugMode: boolean;
  isProfileMode: boolean;
}): BrowserWindowConstructorOptions {
  const isWindows = process.platform === "win32";
  let result: BrowserWindowConstructorOptions = {
    show: isDebugMode,
    roundedCorners: true,
    fullscreenable: false,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: "#000000",
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#ffffff",
      height: 48,
    },
    titleBarStyle: "hidden",
    webPreferences: {
      devTools: isDebugMode || isProfileMode,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
      webviewTag: true,
    },
  };

  if (isWindows) {
    const isDarkMode = nativeTheme.shouldUseDarkColors;
    result = {
      ...result,
      backgroundColor: "#00000000",
      backgroundMaterial: "mica",
      titleBarOverlay: {
        color: "#00000000",
        symbolColor: isDarkMode ? "#ffffff" : "#000000",
        height: 48,
      },
    };
  }

  return result;
}
