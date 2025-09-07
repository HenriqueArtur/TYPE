import { beforeEach, describe, expect, it, vi } from "vitest";
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
      expect(mockElectronAPI.pathParse).toHaveBeenCalledWith(
        "/path/to/scenes/test-scene.scene.json",
      );
      expect(mockElectronAPI.pathJoin).toHaveBeenCalledWith(
        "/path/to/scenes",
        "test-scene.scene.json",
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
      expect(mockElectronAPI.pathJoin).toHaveBeenCalledWith(
        "/path/to/scenes",
        "my-scene.scene.json",
      );
    });
  });

  describe("systemsEnabled", () => {
    it("should return empty array initially", async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        name: "test.scene",
        dir: "/test",
        ext: ".json",
        base: "test.scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/test/test.scene.json");

      const scene = await Scene.fromPath("/test/test.scene.json");

      expect(scene.systemsEnabled).toEqual([]);
    });

    it("should return systems after loading scene", async () => {
      mockElectronAPI.pathParse.mockResolvedValue({
        name: "test.scene",
        dir: "/test",
        ext: ".json",
        base: "test.scene.json",
        root: "/",
      });
      mockElectronAPI.pathJoin.mockResolvedValue("/test/test.scene.json");

      const scene = await Scene.fromPath("/test/test.scene.json");

      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test",
        systems: ["PhysicsSystem", "RenderSystem"],
        gameObjects: [],
      };
      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      await scene.load();

      expect(scene.systemsEnabled).toEqual(["PhysicsSystem", "RenderSystem"]);
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

    it("should load scene data and return systems and entities", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: ["RenderSystem", "PhysicsSystem"],
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

      const result = await scene.load();

      expect(mockElectronAPI.readJsonFile).toHaveBeenCalledWith("/test/path/test.scene.json");
      expect(result.systemsEnabled).toEqual(["RenderSystem", "PhysicsSystem"]);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toEqual({
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
      });
      expect(scene.systemsEnabled).toEqual(["RenderSystem", "PhysicsSystem"]);
    });

    it("should load scene with no systems and only game objects", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: [],
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

      const result = await scene.load();

      expect(result.systemsEnabled).toEqual([]);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toEqual({
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
      });
    });

    it("should handle nested GroupGameObjectSerialized structures", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: [],
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

      const result = await scene.load();

      expect(result.entities).toHaveLength(2);
      expect(result.entities[0]).toEqual({
        name: "Enemy1",
        blueprint: { name: "EnemyBlueprint", path: "/blueprints/enemy" },
        components: [{ name: "Health", data: { hp: 100 } }],
      });
      expect(result.entities[1]).toEqual({
        name: "Enemy2",
        blueprint: { name: "EnemyBlueprint", path: "/blueprints/enemy" },
        components: [{ name: "Health", data: { hp: 50 } }],
      });
    });

    it("should handle empty systems and gameObjects", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: [],
        gameObjects: [],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      const result = await scene.load();

      expect(result.systemsEnabled).toEqual([]);
      expect(result.entities).toEqual([]);
    });

    it("should handle multiple systems", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: ["SystemA", "SystemB"],
        gameObjects: [],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      const result = await scene.load();

      expect(result.systemsEnabled).toEqual(["SystemA", "SystemB"]);
      expect(result.entities).toEqual([]);
      expect(scene.systemsEnabled).toEqual(["SystemA", "SystemB"]);
    });

    it("should handle multiple components per game object", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: [],
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

      const result = await scene.load();

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toEqual({
        name: "ComplexEntity",
        blueprint: { name: "ComplexBlueprint", path: "/blueprints/complex" },
        components: [
          { name: "Transform", data: { x: 10, y: 20 } },
          { name: "Velocity", data: { dx: 1, dy: 0 } },
          { name: "Sprite", data: { texture: "player.png" } },
        ],
      });
    });

    it("should handle complex nested structures with systems and entities", async () => {
      const sceneData: SceneSerialized = {
        name: "test",
        path: "/test/path",
        systems: ["RenderSystem", "PhysicsSystem", "InputSystem"],
        gameObjects: [
          {
            name: "Player",
            blueprint: { name: "PlayerBlueprint", path: "/blueprints/player" },
            components: [{ name: "Transform", data: { x: 0, y: 0 } }],
          },
          {
            name: "EnemyGroup",
            list: [
              {
                name: "Enemy1",
                blueprint: { name: "EnemyBlueprint", path: "/blueprints/enemy" },
                components: [{ name: "Health", data: { hp: 100 } }],
              },
            ],
          },
        ],
      };

      mockElectronAPI.readJsonFile.mockResolvedValue(sceneData);

      const result = await scene.load();

      expect(result.systemsEnabled).toEqual(["RenderSystem", "PhysicsSystem", "InputSystem"]);
      expect(result.entities).toHaveLength(2);
      expect(result.entities[0].name).toBe("Player");
      expect(result.entities[1].name).toBe("Enemy1");
    });
  });
});
