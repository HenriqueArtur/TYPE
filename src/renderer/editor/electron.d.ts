export interface ElectronAPI {
  openGameWindow: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
