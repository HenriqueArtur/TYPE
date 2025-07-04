import path from "node:path";
import { BrowserWindow } from "electron/main";

export function GameWindow(editor_window: BrowserWindow) {
  const game_window = new BrowserWindow({
    width: 600,
    height: 400,
    parent: editor_window,
    webPreferences: {
      contextIsolation: true,
    },
  });

  // Load a different React route or HTML file
  if (process.env.VITE_DEV_SERVER_URL) {
    game_window.loadURL(path.join(__dirname, "../game.html"));
  } else {
    game_window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
