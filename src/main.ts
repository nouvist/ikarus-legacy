import { app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import path from "node:path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    frame: false,
    roundedCorners: true,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: !!MAIN_WINDOW_VITE_DEV_SERVER_URL,
      webviewTag: true,
    },
  });

  // and load the index.html of the app.
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
