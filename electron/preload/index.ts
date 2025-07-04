import { contextBridge, ipcRenderer } from "electron/renderer";

contextBridge.exposeInMainWorld("electronAPI", {
  openGameWindow: () => ipcRenderer.invoke("open-game-window"),
});

declare global {
  interface Window {
    electronAPI: {
      openGameWindow: () => Promise<void>;
    };
  }
}
