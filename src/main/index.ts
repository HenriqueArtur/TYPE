import { promises as fs } from "node:fs";
import path from "node:path";
import { app, BrowserWindow } from "electron";
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
    resizable: false,
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

ipcMain.handle("path-parse", (_, filePath: string) => {
  return path.parse(filePath);
});

ipcMain.handle("path-join", (_, ...paths: string[]) => {
  return path.join(...paths);
});

ipcMain.handle("read-json-file", async (_, filePath: string) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read JSON file: ${(error as Error).message}`);
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
