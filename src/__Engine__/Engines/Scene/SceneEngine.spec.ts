import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TypeEngine } from "../../TypeEngine";
import { Scene } from "./Scene";
import { SceneEngine } from "./SceneEngine";
import type { SceneManageSerialized } from "./SceneManageSerialized";

// Mock Scene class
vi.mock("./Scene");

const mockElectronAPI = {
  openGameWindow: vi.fn(),
  pathParse: vi.fn(),
  pathJoin: vi.fn(),
  readJsonFile: vi.fn(),
};

// Mock only the electronAPI part of the window
Object.defineProperty(global, "window", {
  value: {
    electronAPI: mockElectronAPI,
  },
  writable: true,
});

// Mock TypeEngine
const mockEngine = {
  addSystem: vi.fn(),
  createEntity: vi.fn(),
  addComponent: vi.fn(),
} as unknown as TypeEngine;

// Mock Scene instance
const mockScene = {
  name: "test-scene",
  path: "/path/to/scenes",
  filePath: "/path/to/scenes/test-scene.scene.json",
  load: vi.fn(),
};

describe("SceneEngine", () => {
  let sceneEngine: SceneEngine;
  let sceneManageData: SceneManageSerialized;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();

    sceneManageData = {
      initialScene: "menu",
      scenes: {
        menu: "/scenes/menu.scene.json",
        game: "/scenes/game.scene.json",
        settings: "/scenes/settings.scene.json",
      },
    };

    // Mock Scene.fromPath to return a mock scene
    vi.mocked(Scene.fromPath).mockResolvedValue(mockScene as unknown as Scene);
  });

  describe("constructor", () => {
    it("should initialize with scene data and set initial scene", async () => {
      sceneEngine = new SceneEngine(sceneManageData);

      expect(sceneEngine.has("menu")).toBe(true);
      expect(sceneEngine.has("game")).toBe(true);
      expect(sceneEngine.has("settings")).toBe(true);
      expect(sceneEngine.has("nonexistent")).toBe(false);

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(Scene.fromPath).toHaveBeenCalledWith("/scenes/menu.scene.json");
    });

    it("should handle empty scenes object", () => {
      const emptySceneData: SceneManageSerialized = {
        initialScene: "menu",
        scenes: {},
      };

      sceneEngine = new SceneEngine(emptySceneData);

      expect(sceneEngine.has("menu")).toBe(false);
      expect(sceneEngine.getCurrentScene()).toBeNull();
    });

    it("should handle missing initial scene", () => {
      const invalidSceneData: SceneManageSerialized = {
        initialScene: "nonexistent",
        scenes: {
          menu: "/scenes/menu.scene.json",
        },
      };

      sceneEngine = new SceneEngine(invalidSceneData);

      expect(sceneEngine.has("nonexistent")).toBe(false);
      expect(sceneEngine.has("menu")).toBe(true);
      expect(Scene.fromPath).not.toHaveBeenCalled();
    });
  });

  describe("has", () => {
    beforeEach(() => {
      sceneEngine = new SceneEngine(sceneManageData);
    });

    it("should return true for existing scenes", () => {
      expect(sceneEngine.has("menu")).toBe(true);
      expect(sceneEngine.has("game")).toBe(true);
      expect(sceneEngine.has("settings")).toBe(true);
    });

    it("should return false for non-existing scenes", () => {
      expect(sceneEngine.has("nonexistent")).toBe(false);
      expect(sceneEngine.has("")).toBe(false);
      expect(sceneEngine.has("MENU")).toBe(false); // Case sensitive
    });

    it("should handle special character scene names", () => {
      const specialSceneData: SceneManageSerialized = {
        initialScene: "scene-with_special.chars",
        scenes: {
          "scene-with_special.chars": "/scenes/special.scene.json",
          "scene with spaces": "/scenes/spaces.scene.json",
        },
      };

      sceneEngine = new SceneEngine(specialSceneData);

      expect(sceneEngine.has("scene-with_special.chars")).toBe(true);
      expect(sceneEngine.has("scene with spaces")).toBe(true);
    });
  });

  describe("transition", () => {
    beforeEach(() => {
      sceneEngine = new SceneEngine(sceneManageData);
    });

    it("should successfully transition to an existing scene", async () => {
      await sceneEngine.transition("game", mockEngine);

      expect(Scene.fromPath).toHaveBeenCalledWith("/scenes/game.scene.json");
      expect(mockScene.load).toHaveBeenCalledWith(mockEngine);
      expect(sceneEngine.getCurrentScene()).toBe(mockScene);
    });

    it("should throw error when transitioning to non-existing scene", async () => {
      // Clear any calls from constructor initialization
      vi.clearAllMocks();

      await expect(sceneEngine.transition("nonexistent", mockEngine)).rejects.toThrow(
        'Scene "nonexistent" does not exist',
      );

      expect(Scene.fromPath).not.toHaveBeenCalled();
      expect(mockScene.load).not.toHaveBeenCalled();
    });

    it("should handle scene with empty path", async () => {
      const sceneDataWithEmptyPath: SceneManageSerialized = {
        initialScene: "menu",
        scenes: {
          menu: "/scenes/menu.scene.json",
          emptyPath: "",
        },
      };

      sceneEngine = new SceneEngine(sceneDataWithEmptyPath);

      await expect(sceneEngine.transition("emptyPath", mockEngine)).rejects.toThrow(
        'Scene path not found for "emptyPath"',
      );
    });

    it("should update current scene after successful transition", async () => {
      // Initially should have the initial scene (after async load)
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(sceneEngine.getCurrentScene()).toBe(mockScene);

      const newMockScene = {
        name: "game-scene",
        path: "/path/to/game",
        filePath: "/path/to/game/game-scene.scene.json",
        load: vi.fn(),
      };

      vi.mocked(Scene.fromPath).mockResolvedValueOnce(newMockScene as unknown as Scene);

      await sceneEngine.transition("game", mockEngine);

      expect(sceneEngine.getCurrentScene()).toBe(newMockScene);
    });

    it("should handle multiple transitions", async () => {
      const gameScene = {
        name: "game",
        load: vi.fn(),
      };
      const settingsScene = {
        name: "settings",
        load: vi.fn(),
      };

      vi.mocked(Scene.fromPath)
        .mockResolvedValueOnce(gameScene as unknown as Scene)
        .mockResolvedValueOnce(settingsScene as unknown as Scene);

      await sceneEngine.transition("game", mockEngine);
      expect(sceneEngine.getCurrentScene()).toBe(gameScene);
      expect(gameScene.load).toHaveBeenCalledWith(mockEngine);

      await sceneEngine.transition("settings", mockEngine);
      expect(sceneEngine.getCurrentScene()).toBe(settingsScene);
      expect(settingsScene.load).toHaveBeenCalledWith(mockEngine);
    });

    it("should handle Scene.fromPath errors", async () => {
      const error = new Error("Failed to create scene from path");
      vi.mocked(Scene.fromPath).mockRejectedValueOnce(error);

      await expect(sceneEngine.transition("game", mockEngine)).rejects.toThrow(
        "Failed to create scene from path",
      );

      expect(mockScene.load).not.toHaveBeenCalled();
    });

    it("should handle scene load errors", async () => {
      const loadError = new Error("Scene failed to load");
      const failingScene = {
        name: "failing-scene",
        load: vi.fn().mockRejectedValue(loadError),
      };

      vi.mocked(Scene.fromPath).mockResolvedValueOnce(failingScene as unknown as Scene);

      await expect(sceneEngine.transition("game", mockEngine)).rejects.toThrow(
        "Scene failed to load",
      );

      expect(failingScene.load).toHaveBeenCalledWith(mockEngine);
      // Current scene should still be updated even if load fails
      expect(sceneEngine.getCurrentScene()).toBe(failingScene);
    });
  });

  describe("getCurrentScene", () => {
    it("should return null initially before any scene is set", () => {
      sceneEngine = new SceneEngine({
        initialScene: "nonexistent",
        scenes: {
          menu: "/scenes/menu.scene.json",
        },
      });

      expect(sceneEngine.getCurrentScene()).toBeNull();
    });

    it("should return current scene after initialization", async () => {
      sceneEngine = new SceneEngine(sceneManageData);

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sceneEngine.getCurrentScene()).toBe(mockScene);
    });

    it("should return updated scene after transition", async () => {
      sceneEngine = new SceneEngine(sceneManageData);

      const newScene = {
        name: "new-scene",
        load: vi.fn(),
      };

      vi.mocked(Scene.fromPath).mockResolvedValueOnce(newScene as unknown as Scene);

      await sceneEngine.transition("game", mockEngine);

      expect(sceneEngine.getCurrentScene()).toBe(newScene);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle empty scene name", () => {
      sceneEngine = new SceneEngine(sceneManageData);

      expect(sceneEngine.has("")).toBe(false);
    });

    it("should handle null/undefined scene names gracefully", () => {
      sceneEngine = new SceneEngine(sceneManageData);

      expect(sceneEngine.has(null as unknown as string)).toBe(false);
      expect(sceneEngine.has(undefined as unknown as string)).toBe(false);
    });

    it("should handle scenes with same name but different cases", () => {
      const caseSceneData: SceneManageSerialized = {
        initialScene: "Menu",
        scenes: {
          Menu: "/scenes/Menu.scene.json",
          menu: "/scenes/menu.scene.json",
          MENU: "/scenes/MENU.scene.json",
        },
      };

      sceneEngine = new SceneEngine(caseSceneData);

      expect(sceneEngine.has("Menu")).toBe(true);
      expect(sceneEngine.has("menu")).toBe(true);
      expect(sceneEngine.has("MENU")).toBe(true);
      expect(sceneEngine.has("mEnU")).toBe(false);
    });

    it("should handle large number of scenes efficiently", () => {
      const largeSceneData: SceneManageSerialized = {
        initialScene: "scene0",
        scenes: {},
      };

      // Generate 1000 scenes
      for (let i = 0; i < 1000; i++) {
        largeSceneData.scenes[`scene${i}`] = `/scenes/scene${i}.scene.json`;
      }

      sceneEngine = new SceneEngine(largeSceneData);

      expect(sceneEngine.has("scene0")).toBe(true);
      expect(sceneEngine.has("scene500")).toBe(true);
      expect(sceneEngine.has("scene999")).toBe(true);
      expect(sceneEngine.has("scene1000")).toBe(false);
    });
  });
});
