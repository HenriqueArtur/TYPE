import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, app } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  return new BrowserWindow({
    title: "Engine TS",
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
}

app.whenReady().then(() => {
  const win = createWindow();
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
