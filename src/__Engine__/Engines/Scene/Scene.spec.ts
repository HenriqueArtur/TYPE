import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TypeEngine } from "../../TypeEngine";
import { Scene } from "./Scene";
import type { SceneSerialized } from "./SceneSerialized";

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
const createEntityMock = vi.fn();
const mockEngine = {
  addSystem: vi.fn(),
  createEntity: createEntityMock,
  addComponent: vi.fn(),
} as unknown as TypeEngine;

describe("Scene", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
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

  describe("load", () => {
    let scene: Scene;

    beforeEach(async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        dir: "/test/path",
        name: "test.scene",
        ext: ".json",
        base: "test.scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/test/path/test.scene.json");

      scene = await Scene.fromPath("/test/path/test.scene.json");
    });

    it("should load scene data and handle system import failures gracefully", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {
          RenderSystem: "/path/to/nonexistent-system",
        },
        gameObjects: [
          {
            name: "Player",
            blueprint: {
              name: "PlayerBlueprint",
              path: "/blueprints/player",
            },
            components: [
              {
                name: "Transform",
                data: { x: 0, y: 0 },
              },
            ],
          },
        ],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);
      createEntityMock.mockReturnValue("entity_1");

      // Mock console.warn to suppress warnings in tests
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await scene.load(mockEngine);

      expect(mockElectronAPI.readJsonFile).toHaveBeenCalledWith("/test/path/test.scene.json");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to load system RenderSystem from /path/to/nonexistent-system:",
        expect.any(Error),
      );
      expect(mockEngine.addSystem).not.toHaveBeenCalled(); // System import failed
      expect(createEntityMock).toHaveBeenCalled(); // But game objects still loaded
      expect(mockEngine.addComponent).toHaveBeenCalledWith("entity_1", "Transform", { x: 0, y: 0 });

      consoleWarnSpy.mockRestore();
    });

    it("should load scene with no systems and only game objects", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {},
        gameObjects: [
          {
            name: "SimpleEntity",
            blueprint: {
              name: "SimpleBlueprint",
              path: "/blueprints/simple",
            },
            components: [
              {
                name: "Position",
                data: { x: 5, y: 10 },
              },
            ],
          },
        ],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);
      createEntityMock.mockReturnValue("simple_entity");

      await scene.load(mockEngine);

      expect(mockEngine.addSystem).not.toHaveBeenCalled();
      expect(createEntityMock).toHaveBeenCalledTimes(1);
      expect(mockEngine.addComponent).toHaveBeenCalledWith("simple_entity", "Position", {
        x: 5,
        y: 10,
      });
    });

    it("should handle nested GroupGameObjectSerialized structures", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {},
        gameObjects: [
          {
            name: "EnemyGroup",
            list: [
              {
                name: "Enemy1",
                blueprint: { name: "EnemyBlueprint", path: "/blueprints/enemy" },
                components: [{ name: "Health", data: { hp: 100 } }],
              },
              {
                name: "SubGroup",
                list: [
                  {
                    name: "Enemy2",
                    blueprint: { name: "EnemyBlueprint", path: "/blueprints/enemy" },
                    components: [{ name: "Health", data: { hp: 50 } }],
                  },
                ],
              },
            ],
          },
        ],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);
      createEntityMock.mockReturnValueOnce("entity_1").mockReturnValueOnce("entity_2");

      await scene.load(mockEngine);

      expect(createEntityMock).toHaveBeenCalledTimes(2);
      expect(mockEngine.addComponent).toHaveBeenCalledWith("entity_1", "Health", { hp: 100 });
      expect(mockEngine.addComponent).toHaveBeenCalledWith("entity_2", "Health", { hp: 50 });
    });

    it("should handle empty systems and gameObjects", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {},
        gameObjects: [],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      await scene.load(mockEngine);

      expect(mockEngine.addSystem).not.toHaveBeenCalled();
      expect(createEntityMock).not.toHaveBeenCalled();
      expect(mockEngine.addComponent).not.toHaveBeenCalled();
    });

    it("should handle systems that fail to import", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {
          MissingSystem: "/path/to/missing-system",
          AnotherMissingSystem: "/path/to/another-missing-system",
        },
        gameObjects: [],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      // Mock console.warn to suppress warnings in tests
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await scene.load(mockEngine);

      expect(mockEngine.addSystem).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2); // Two systems failed to import

      consoleWarnSpy.mockRestore();
    });

    it("should handle multiple components per game object", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {},
        gameObjects: [
          {
            name: "ComplexEntity",
            blueprint: { name: "ComplexBlueprint", path: "/blueprints/complex" },
            components: [
              { name: "Transform", data: { x: 10, y: 20 } },
              { name: "Velocity", data: { dx: 1, dy: 0 } },
              { name: "Sprite", data: { texture: "player.png" } },
            ],
          },
        ],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);
      createEntityMock.mockReturnValue("entity_complex");

      await scene.load(mockEngine);

      expect(createEntityMock).toHaveBeenCalledTimes(1);
      expect(mockEngine.addComponent).toHaveBeenCalledTimes(3);
      expect(mockEngine.addComponent).toHaveBeenCalledWith("entity_complex", "Transform", {
        x: 10,
        y: 20,
      });
      expect(mockEngine.addComponent).toHaveBeenCalledWith("entity_complex", "Velocity", {
        dx: 1,
        dy: 0,
      });
      expect(mockEngine.addComponent).toHaveBeenCalledWith("entity_complex", "Sprite", {
        texture: "player.png",
      });
    });

    it("should handle multiple systems that fail to import", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: {
          RenderSystem: "/systems/render",
          PhysicsSystem: "/systems/physics",
          InputSystem: "/systems/input",
        },
        gameObjects: [],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      // Mock console.warn to suppress warnings in tests
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await scene.load(mockEngine);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(3); // Three systems failed to import
      expect(mockEngine.addSystem).not.toHaveBeenCalled(); // No systems loaded

      consoleWarnSpy.mockRestore();
    });
  });
});
