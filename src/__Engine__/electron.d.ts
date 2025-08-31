declare global {
  interface Window {
    electronAPI: {
      openGameWindow: () => Promise<void>;
      pathParse: (
        filePath: string,
      ) => Promise<{ name: string; dir: string; ext: string; base: string; root: string }>;
      pathJoin: (...paths: string[]) => Promise<string>;
      readJsonFile: (filePath: string) => Promise<SceneSerialized>;
    };
  }
}
