import { promises as fs } from "node:fs";
import path from "node:path";
import { app, BrowserWindow } from "electron";
import { ipcMain } from "electron/main";

let mainWindow: BrowserWindow;
let gameWindow: BrowserWindow | null = null;

export function _createMainWindow() {
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

  // if (process.env.VITE_DEV_SERVER_URL) {
  //   gameWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/game.html`);
  // } else {
  //   gameWindow.loadFile(path.join(__dirname, "../renderer/game/index.html"));
  // }
  gameWindow.loadFile(path.join(__dirname, "../renderer/game/index.html"));

  gameWindow.on("closed", () => {
    gameWindow = null;
  });
}

app.whenReady().then(createGameWindow);
// app.whenReady().then(createMainWindow);

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
    let fullPath: string;

    if (app.isPackaged) {
      // Handle different platforms for packaged apps
      const cleanPath = filePath.replace(/^\.\.\//, ""); // Remove "../"

      if (process.platform === "win32") {
        // On Windows, try multiple possible locations for resources
        const possiblePaths = [
          path.join(process.resourcesPath, cleanPath),
          path.join(process.resourcesPath, "app.asar.unpacked", cleanPath),
          path.join(path.dirname(process.execPath), "resources", cleanPath),
        ];

        fullPath = possiblePaths[0]; // Default to first option
        for (const testPath of possiblePaths) {
          try {
            await fs.access(testPath);
            fullPath = testPath;
            break;
          } catch {
            // Continue to next path
          }
        }
      } else {
        // On macOS/Linux, extraResources are in Resources directory
        fullPath = path.join(process.resourcesPath, cleanPath);
      }
    } else {
      // In development, use the out directory
      fullPath = path.join(__dirname, filePath);
    }

    const fileContent = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read JSON file: ${(error as Error).message}`);
  }
});

ipcMain.handle("absolute-path", async (_, filePath: string) => {
  // In development: use the out directory
  // In packaged app: use the extraResources directory
  let fullPath: string;

  if (app.isPackaged) {
    // Handle different platforms for packaged apps
    const cleanPath = filePath.replace(/^\.\.\//, ""); // Remove "../"

    if (process.platform === "win32") {
      // On Windows, try multiple possible locations for resources
      const possiblePaths = [
        path.join(process.resourcesPath, cleanPath),
        path.join(process.resourcesPath, "app.asar.unpacked", cleanPath),
        path.join(path.dirname(process.execPath), "resources", cleanPath),
      ];

      fullPath = possiblePaths[0]; // Default to first option
      for (const testPath of possiblePaths) {
        try {
          await fs.access(testPath);
          fullPath = testPath;
          break;
        } catch {
          // Continue to next path
        }
      }
    } else {
      // On macOS/Linux, extraResources are in Resources directory
      fullPath = path.join(process.resourcesPath, cleanPath);
    }
  } else {
    // In development, use the out directory
    fullPath = path.join(__dirname, filePath);
  }

  return fullPath;
});

app.on("window-all-closed", () => {
  app.quit();
});
