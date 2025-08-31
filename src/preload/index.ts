import { contextBridge, ipcRenderer } from "electron/renderer";

contextBridge.exposeInMainWorld("electronAPI", {
  openGameWindow: () => ipcRenderer.invoke("open-game-window"),
  pathParse: (filePath: string) => ipcRenderer.invoke("path-parse", filePath),
  pathJoin: (...paths: string[]) => ipcRenderer.invoke("path-join", ...paths),
  readJsonFile: (filePath: string) => ipcRenderer.invoke("read-json-file", filePath),
});

declare global {
  interface Window {
    electronAPI: {
      openGameWindow: () => Promise<void>;
      pathParse: (
        filePath: string,
      ) => Promise<{ name: string; dir: string; ext: string; base: string; root: string }>;
      pathJoin: (...paths: string[]) => Promise<string>;
      readJsonFile: <T>(filePath: string) => Promise<T>;
    };
  }
}
