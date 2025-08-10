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
    mainWindow.loadFile(path.join(__dirname, "../renderer/editor/index.html"));
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
      preload: path.join(__dirname, "../preload/index.mjs"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    gameWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/game.html`);
  } else {
    gameWindow.loadFile(path.join(__dirname, "../renderer/game/index.html"));
  }

  gameWindow.on("closed", () => {
    gameWindow = null;
  });
}

if (process.env.APP_MODE === "game") {
  app.whenReady().then(createGameWindow);
} else {
  app.whenReady().then(createMainWindow);
}

ipcMain.handle("open-game-window", () => {
  createGameWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
