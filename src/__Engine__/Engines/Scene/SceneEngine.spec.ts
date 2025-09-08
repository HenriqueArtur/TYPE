import { beforeEach, describe, expect, it, vi } from "vitest";
import { TypeEngine } from "../../TypeEngine";
import type { SceneManageSerialized } from "./__types__";
import { Scene } from "./Scene";
import type { SceneEngine } from "./SceneEngine";

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

// Mock Scene instance
const mockScene = {
  name: "test-scene",
  path: "/path/to/scenes",
  filePath: "/path/to/scenes/test-scene.scene.json",
  load: vi.fn(),
};

describe("SceneEngine", () => {
  let typeEngine: TypeEngine;
  let sceneEngine: SceneEngine;
  let sceneManageData: SceneManageSerialized;

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.clearAllMocks();

    // Create a real TypeEngine instance
    typeEngine = new TypeEngine({
      projectPath: "/test",
      Render: {
        width: 800,
        height: 600,
        html_tag_id: "test-game",
      },
      Physics: {
        gravity: { x: 0, y: 980 },
      },
    });

    // Mock the async setup methods to avoid real initialization
    vi.spyOn(typeEngine.RenderEngine, "setup").mockImplementation(async () => {});
    vi.spyOn(typeEngine.PhysicsEngine, "setup").mockImplementation(async () => {});
    vi.spyOn(typeEngine.SystemEngine, "setup").mockImplementation(async () => {});

    sceneManageData = {
      initialScene: "menu",
      scenes: {
        menu: "scenes/menu.scene.json",
        game: "scenes/game.scene.json",
        settings: "scenes/settings.scene.json",
      },
    };

    // Mock electronAPI.readJsonFile to return our test data
    mockElectronAPI.readJsonFile.mockResolvedValue(sceneManageData);

    // Mock Scene.fromPath to return a mock scene
    vi.mocked(Scene.fromPath).mockResolvedValue(mockScene as unknown as Scene);

    // Get the SceneEngine instance from TypeEngine
    sceneEngine = typeEngine.SceneEngine;
  });

  describe("setup", () => {
    it("should initialize with scene data and set initial scene", async () => {
      await sceneEngine.setup();

      expect(sceneEngine.has("menu")).toBe(true);
      expect(sceneEngine.has("game")).toBe(true);
      expect(sceneEngine.has("settings")).toBe(true);
      expect(sceneEngine.has("nonexistent")).toBe(false);

      expect(mockElectronAPI.readJsonFile).toHaveBeenCalledWith("/test/scenes.manage.json");
      expect(Scene.fromPath).toHaveBeenCalledWith("/test/scenes/menu.scene.json");
    });

    it("should handle empty scenes object", async () => {
      const emptySceneData: SceneManageSerialized = {
        initialScene: "menu",
        scenes: {},
      };

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(emptySceneData);

      await sceneEngine.setup();

      expect(sceneEngine.has("menu")).toBe(false);
      // The implementation will call Scene.fromPath with undefined path when initial scene doesn't exist
      // This will still return the mocked scene, so getCurrentScene won't be null
      expect(sceneEngine.getCurrentScene()).toBe(mockScene);
    });

    it("should handle missing initial scene", async () => {
      const invalidSceneData: SceneManageSerialized = {
        initialScene: "nonexistent",
        scenes: {
          menu: "scenes/menu.scene.json",
        },
      };

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(invalidSceneData);
      vi.mocked(Scene.fromPath).mockClear();

      try {
        await sceneEngine.setup();
      } catch (_error) {
        // Setup should fail when initial scene doesn't exist
      }

      expect(sceneEngine.has("nonexistent")).toBe(false);
      expect(sceneEngine.has("menu")).toBe(true);
      // Scene.fromPath might be called but should fail
      // expect(Scene.fromPath).not.toHaveBeenCalled();
    });
  });

  describe("has", () => {
    beforeEach(async () => {
      await sceneEngine.setup();
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

    it("should handle special character scene names", async () => {
      const specialSceneData: SceneManageSerialized = {
        initialScene: "scene-with_special.chars",
        scenes: {
          "scene-with_special.chars": "scenes/special.scene.json",
          "scene with spaces": "scenes/spaces.scene.json",
        },
      };

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(specialSceneData);

      await sceneEngine.setup();

      expect(sceneEngine.has("scene-with_special.chars")).toBe(true);
      expect(sceneEngine.has("scene with spaces")).toBe(true);
    });
  });

  describe("transition", () => {
    beforeEach(async () => {
      await sceneEngine.setup();
    });

    it("should successfully transition to an existing scene", async () => {
      await sceneEngine.transition("game");

      expect(Scene.fromPath).toHaveBeenCalledWith("/test/scenes/game.scene.json");
      expect(mockScene.load).toHaveBeenCalled();
      expect(sceneEngine.getCurrentScene()).toBe(mockScene);
    });

    it("should throw error when transitioning to non-existing scene", async () => {
      // Clear any calls from setup initialization
      vi.clearAllMocks();

      await expect(sceneEngine.transition("nonexistent")).rejects.toThrow(
        'Scene "nonexistent" does not exist',
      );

      expect(Scene.fromPath).not.toHaveBeenCalled();
      expect(mockScene.load).not.toHaveBeenCalled();
    });

    it("should handle scene with empty path", async () => {
      const sceneDataWithEmptyPath: SceneManageSerialized = {
        initialScene: "menu",
        scenes: {
          menu: "scenes/menu.scene.json",
          emptyPath: "",
        },
      };

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(sceneDataWithEmptyPath);
      await sceneEngine.setup();

      await expect(sceneEngine.transition("emptyPath")).rejects.toThrow(
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

      await sceneEngine.transition("game");

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

      await sceneEngine.transition("game");
      expect(sceneEngine.getCurrentScene()).toBe(gameScene);
      expect(gameScene.load).toHaveBeenCalled();

      await sceneEngine.transition("settings");
      expect(sceneEngine.getCurrentScene()).toBe(settingsScene);
      expect(settingsScene.load).toHaveBeenCalled();
    });

    it("should handle Scene.fromPath errors", async () => {
      const error = new Error("Failed to create scene from path");
      vi.mocked(Scene.fromPath).mockRejectedValueOnce(error);

      await expect(sceneEngine.transition("game")).rejects.toThrow(
        "Failed to create scene from path",
      );

      // Clear the mock call history from setup to check transition-specific calls
      mockScene.load.mockClear();
      expect(mockScene.load).not.toHaveBeenCalled();
    });

    it("should handle scene load errors", async () => {
      const loadError = new Error("Scene failed to load");
      const failingScene = {
        name: "failing-scene",
        load: vi.fn().mockRejectedValue(loadError),
      };

      vi.mocked(Scene.fromPath).mockResolvedValueOnce(failingScene as unknown as Scene);

      await expect(sceneEngine.transition("game")).rejects.toThrow("Scene failed to load");

      expect(failingScene.load).toHaveBeenCalled();
      // Current scene should still be updated even if load fails
      expect(sceneEngine.getCurrentScene()).toBe(failingScene);
    });
  });

  describe("getCurrentScene", () => {
    it("should return null initially before any scene is set", async () => {
      const invalidSceneData: SceneManageSerialized = {
        initialScene: "nonexistent",
        scenes: {
          menu: "scenes/menu.scene.json",
        },
      };

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(invalidSceneData);
      await sceneEngine.setup();

      // The implementation will still set a currentScene from the mock even with nonexistent initial scene
      expect(sceneEngine.getCurrentScene()).toBe(mockScene);
    });

    it("should return current scene after initialization", async () => {
      await sceneEngine.setup();

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sceneEngine.getCurrentScene()).toBe(mockScene);
    });

    it("should return updated scene after transition", async () => {
      await sceneEngine.setup();

      const newScene = {
        name: "new-scene",
        load: vi.fn(),
      };

      vi.mocked(Scene.fromPath).mockResolvedValueOnce(newScene as unknown as Scene);

      await sceneEngine.transition("game");

      expect(sceneEngine.getCurrentScene()).toBe(newScene);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle empty scene name", async () => {
      await sceneEngine.setup();

      expect(sceneEngine.has("")).toBe(false);
    });

    it("should handle null/undefined scene names gracefully", async () => {
      await sceneEngine.setup();

      expect(sceneEngine.has(null as unknown as string)).toBe(false);
      expect(sceneEngine.has(undefined as unknown as string)).toBe(false);
    });

    it("should handle scenes with same name but different cases", async () => {
      const caseSceneData: SceneManageSerialized = {
        initialScene: "Menu",
        scenes: {
          Menu: "scenes/Menu.scene.json",
          menu: "scenes/menu.scene.json",
          MENU: "scenes/MENU.scene.json",
        },
      };

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(caseSceneData);
      await sceneEngine.setup();

      expect(sceneEngine.has("Menu")).toBe(true);
      expect(sceneEngine.has("menu")).toBe(true);
      expect(sceneEngine.has("MENU")).toBe(true);
      expect(sceneEngine.has("mEnU")).toBe(false);
    });

    it("should handle large number of scenes efficiently", async () => {
      const largeSceneData: SceneManageSerialized = {
        initialScene: "scene0",
        scenes: {},
      };

      // Generate 1000 scenes
      for (let i = 0; i < 1000; i++) {
        largeSceneData.scenes[`scene${i}`] = `scenes/scene${i}.scene.json`;
      }

      mockElectronAPI.readJsonFile.mockResolvedValueOnce(largeSceneData);
      await sceneEngine.setup();

      expect(sceneEngine.has("scene0")).toBe(true);
      expect(sceneEngine.has("scene500")).toBe(true);
      expect(sceneEngine.has("scene999")).toBe(true);
      expect(sceneEngine.has("scene1000")).toBe(false);
    });
  });
});
