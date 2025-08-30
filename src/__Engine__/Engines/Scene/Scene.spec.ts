import { beforeEach, describe, expect, it, vi } from "vitest";
import { Scene } from "./Scene";

// Mock Electron API with proper types
const mockElectronAPI = {
  openGameWindow: vi.fn(),
  pathParse: vi.fn(),
  pathJoin: vi.fn(),
};

// Mock only the electronAPI part of the window
Object.defineProperty(global, "window", {
  value: {
    electronAPI: mockElectronAPI,
  },
  writable: true,
});

// Extend Window interface for this test file
declare global {
  interface Window {
    electronAPI: {
      openGameWindow: () => Promise<void>;
      pathParse: (
        filePath: string,
      ) => Promise<{ name: string; dir: string; ext: string; base: string; root: string }>;
      pathJoin: (...paths: string[]) => Promise<string>;
    };
  }
}

describe("Scene", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("fromPath", () => {
    it("should extract name from scene path", async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        name: "test-scene.scene",
        dir: "/path/to/scenes",
        ext: ".json",
        base: "test-scene.scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/path/to/scenes/test-scene.scene.json");

      const scene = await Scene.fromPath("/path/to/scenes/test-scene.scene.json");

      expect(scene.name).toBe("test-scene");
      expect(scene.path).toBe("/path/to/scenes");
      expect(mockElectronAPI.pathParse).toHaveBeenCalledWith(
        "/path/to/scenes/test-scene.scene.json",
      );
    });

    it("should handle path without .scene extension", async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        name: "my-scene",
        dir: "/path/to/scenes",
        ext: ".json",
        base: "my-scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/path/to/scenes/my-scene.scene.json");

      const scene = await Scene.fromPath("/path/to/scenes/my-scene.json");

      expect(scene.name).toBe("my-scene");
      expect(scene.path).toBe("/path/to/scenes");
    });
  });

  describe("filePath", () => {
    it("should generate correct file path with .scene.json extension", async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        name: "my-scene.scene",
        dir: "/games/scenes",
        ext: ".json",
        base: "my-scene.scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/games/scenes/my-scene.scene.json");

      const scene = await Scene.fromPath("/games/scenes/my-scene.scene.json");

      expect(scene.filePath).toBe("/games/scenes/my-scene.scene.json");
    });

    it("should handle special characters in scene name", async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        name: "scene-with_special.chars.scene",
        dir: "/path",
        ext: ".json",
        base: "scene-with_special.chars.scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/path/scene-with_special.chars.scene.json");

      const scene = await Scene.fromPath("/path/scene-with_special.chars.scene.json");

      expect(scene.filePath).toBe("/path/scene-with_special.chars.scene.json");
    });
  });
});
