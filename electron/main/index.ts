import path from "node:path";
import { BrowserWindow, app } from "electron";
import { ipcMain } from "electron/main";

let mainWindow: BrowserWindow;
let gameWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Engine TS",
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function createGameWindow(): void {
  if (gameWindow) {
    gameWindow.focus();
    return;
  }

  gameWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    gameWindow.loadURL(path.join(__dirname, "../renderer/game.html"));
  } else {
    gameWindow.loadFile(path.join(__dirname, "../renderer/game.html"));
  }

  gameWindow.on("closed", () => {
    gameWindow = null;
  });
}

app.whenReady().then(createMainWindow);

ipcMain.handle("open-game-window", () => {
  createGameWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
