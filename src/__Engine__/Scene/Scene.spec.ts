import { beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent, TextureComponent } from "../Component";
import type { SpriteComponent } from "../Component/Drawable/SpriteComponent";
import type { GameObject, GameObjectDataJson } from "../GameObject";
import { ConcreteGameObject } from "../GameObject/ConcreteGameObject";
import { generateId } from "../Utils/id";
import { GameScene, type GameSceneData } from "./index";

// Mock dependencies
vi.mock("../Utils/id", () => ({
  generateId: vi.fn(),
}));

vi.mock("../Component", () => ({
  createComponent: vi.fn(),
  TextureComponent: vi.fn(),
}));

vi.mock("../GameObject/ConcreteGameObject", () => ({
  ConcreteGameObject: vi.fn(),
}));

// Mock dynamic imports for script loading
const mockGameObjectClass = vi.fn();
vi.mock("../../__Project__/TestGameObject.ts", () => ({
  TestGameObject: mockGameObjectClass,
}));

describe("GameScene", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (generateId as ReturnType<typeof vi.fn>).mockReturnValue("SC_123456");
  });

  describe("static properties", () => {
    it("should have correct type identifier", () => {
      expect(GameScene.type).toBe("GameScene");
    });

    it("should have correct prefix", () => {
      expect(GameScene.prefix).toBe("SC");
    });
  });

  describe("constructor", () => {
    it("should create scene with provided data", () => {
      const mockGameObject = { name: "TestObject" } as GameObject;
      const mockSpriteComponent = { type: "SpriteComponent" } as unknown as SpriteComponent;

      const sceneData: GameSceneData = {
        name: "TestScene",
        gameObjects: [mockGameObject],
        components: {
          sprites: [mockSpriteComponent],
          bodies: [],
        },
      };

      const scene = new GameScene(sceneData);

      expect(scene.id).toBe("SC_123456");
      expect(scene.name).toBe("TestScene");
      expect(scene.gameObjects).toEqual([mockGameObject]);
      expect(scene.components.sprites).toEqual([mockSpriteComponent]);
    });

    it("should generate unique ID using prefix", () => {
      const sceneData: GameSceneData = {
        name: "TestScene",
        gameObjects: [],
        components: { sprites: [], bodies: [] },
      };

      new GameScene(sceneData);

      expect(generateId).toHaveBeenCalledWith("SC");
    });

    it("should handle empty game objects and components", () => {
      const sceneData: GameSceneData = {
        name: "EmptyScene",
        gameObjects: [],
        components: { sprites: [], bodies: [] },
      };

      const scene = new GameScene(sceneData);

      expect(scene.gameObjects).toEqual([]);
      expect(scene.components.sprites).toEqual([]);
    });

    it("should handle multiple game objects", () => {
      const mockGameObject1 = { name: "Object1" } as GameObject;
      const mockGameObject2 = { name: "Object2" } as GameObject;

      const sceneData: GameSceneData = {
        name: "MultiObjectScene",
        gameObjects: [mockGameObject1, mockGameObject2],
        components: { sprites: [], bodies: [] },
      };

      const scene = new GameScene(sceneData);

      expect(scene.gameObjects).toHaveLength(2);
      expect(scene.gameObjects[0]).toBe(mockGameObject1);
      expect(scene.gameObjects[1]).toBe(mockGameObject2);
    });

    it("should handle multiple sprite components", () => {
      const mockSprite1 = { type: "SpriteComponent", id: "sprite1" } as unknown as SpriteComponent;
      const mockSprite2 = { type: "SpriteComponent", id: "sprite2" } as unknown as SpriteComponent;

      const sceneData: GameSceneData = {
        name: "MultiSpriteScene",
        gameObjects: [],
        components: {
          sprites: [mockSprite1, mockSprite2],
          bodies: [],
        },
      };

      const scene = new GameScene(sceneData);

      expect(scene.components.sprites).toHaveLength(2);
      expect(scene.components.sprites[0]).toBe(mockSprite1);
      expect(scene.components.sprites[1]).toBe(mockSprite2);
    });
  });

  describe("load static method", () => {
    describe("JSON string input", () => {
      it("should parse JSON string and create scene", async () => {
        const sceneDataJson = JSON.stringify({
          name: "JSONScene",
          gameObjects: [],
        });

        const scene = await GameScene.load(sceneDataJson);

        expect(scene.name).toBe("JSONScene");
        expect(scene.gameObjects).toEqual([]);
        expect(scene.components.sprites).toEqual([]);
      });

      it("should handle malformed JSON gracefully", async () => {
        const malformedJson = "{ invalid json }";

        await expect(GameScene.load(malformedJson)).rejects.toThrow();
      });
    });

    describe("object input", () => {
      it("should create scene from object data", async () => {
        const sceneData = {
          name: "ObjectScene",
          gameObjects: [],
        };

        const scene = await GameScene.load(sceneData);

        expect(scene.name).toBe("ObjectScene");
        expect(scene.gameObjects).toEqual([]);
      });
    });

    describe("game objects without scripts", () => {
      it("should create ConcreteGameObject for objects without scripts", async () => {
        const mockComponent = { type: "TransformComponent" };
        const mockConcreteGameObject = { name: "ConcreteObject" };

        (createComponent as ReturnType<typeof vi.fn>).mockReturnValue(mockComponent);
        (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
          mockConcreteGameObject,
        );

        const sceneData = {
          name: "ConcreteScene",
          gameObjects: [
            {
              id: "obj1",
              name: "TestObject",
              components: {
                transform: {
                  type: "TransformComponent",
                  name: "transform",
                  initial_values: { position: { x: 0, y: 0 } },
                },
              },
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(createComponent).toHaveBeenCalledWith({
          type: "TransformComponent",
          name: "transform",
          initial_values: { position: { x: 0, y: 0 } },
        });
        expect(ConcreteGameObject).toHaveBeenCalledWith({
          transform: mockComponent,
        });
        expect(scene.gameObjects).toEqual([mockConcreteGameObject]);
      });

      it("should handle SpriteComponent creation and add to sprites array", async () => {
        const mockSpriteComponent = { type: "SpriteComponent" } as unknown as SpriteComponent;

        (createComponent as ReturnType<typeof vi.fn>).mockReturnValue(mockSpriteComponent);
        (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue({});

        const sceneData = {
          name: "SpriteScene",
          gameObjects: [
            {
              id: "obj1",
              name: "SpriteObject",
              components: {
                sprite: {
                  type: "SpriteComponent",
                  name: "sprite",
                  initial_values: { texture: "test.png", rotation: 0 },
                },
              },
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(scene.components.sprites).toContain(mockSpriteComponent);
      });

      it("should handle multiple components per game object", async () => {
        const mockTransformComponent = { type: "TransformComponent" };
        const mockSpriteComponent = { type: "SpriteComponent" } as unknown as SpriteComponent;

        (createComponent as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce(mockTransformComponent)
          .mockReturnValueOnce(mockSpriteComponent);
        (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue({});

        const sceneData = {
          name: "MultiComponentScene",
          gameObjects: [
            {
              id: "obj1",
              name: "MultiComponentObject",
              components: {
                transform: {
                  type: "TransformComponent",
                  name: "transform",
                  initial_values: {},
                },
                sprite: {
                  type: "SpriteComponent",
                  name: "sprite",
                  initial_values: { texture: "test.png", rotation: 0 },
                },
              },
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(createComponent).toHaveBeenCalledTimes(2);
        expect(ConcreteGameObject).toHaveBeenCalledWith({
          transform: mockTransformComponent,
          sprite: mockSpriteComponent,
        });
        expect(scene.components.sprites).toContain(mockSpriteComponent);
      });
    });

    describe("game objects with scripts", () => {
      it("should load and instantiate scripted game objects", async () => {
        const mockTextureComponent = { path: "test.png" };
        const mockGameObjectInstance = {
          name: "ScriptedObject",
          sprite: { type: "SpriteComponent" },
        };

        (TextureComponent as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
          mockTextureComponent,
        );
        mockGameObjectClass.mockReturnValue(mockGameObjectInstance);

        // Mock the dynamic import
        vi.doMock("../../__Project__/TestGameObject.ts", () => ({
          TestGameObject: mockGameObjectClass,
        }));

        const sceneData = {
          name: "ScriptedScene",
          gameObjects: [
            {
              id: "obj1",
              name: "TestGameObject",
              script: "TestGameObject.js",
              components: {
                sprite: {
                  type: "SpriteComponent",
                  name: "sprite",
                  initial_values: {
                    texture: "test.png",
                    rotation: 0,
                    position: { x: 10, y: 20 },
                  },
                },
              },
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(TextureComponent).toHaveBeenCalledWith({ path: "test.png" });
        expect(mockGameObjectClass).toHaveBeenCalledWith({
          sprite: {
            rotation: 0,
            position: { x: 10, y: 20 },
            texture: mockTextureComponent,
          },
        });
        expect(scene.gameObjects).toContain(mockGameObjectInstance);
        expect(scene.components.sprites).toContain(mockGameObjectInstance.sprite);
      });

      it("should handle scripted objects without sprite components", async () => {
        const mockGameObjectInstance = { name: "NoSpriteObject" };

        mockGameObjectClass.mockReturnValue(mockGameObjectInstance);

        vi.doMock("../../__Project__/NoSpriteObject.ts", () => ({
          NoSpriteObject: mockGameObjectClass,
        }));

        const sceneData = {
          name: "NoSpriteScene",
          gameObjects: [
            {
              id: "obj1",
              name: "NoSpriteObject",
              script: "NoSpriteObject.js",
              components: {
                transform: {
                  type: "TransformComponent",
                  name: "transform",
                  initial_values: {},
                },
              },
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(scene.gameObjects).toContain(mockGameObjectInstance);
        expect(scene.components.sprites).toHaveLength(0);
      });

      it("should convert .js script paths to .ts for import", async () => {
        // This test verifies the path conversion logic indirectly
        // by testing that a .js script can be loaded (the implementation converts to .ts)
        const mockGameObjectInstance = { name: "PathTestObject" };
        mockGameObjectClass.mockReturnValue(mockGameObjectInstance);

        vi.doMock("../../__Project__/PathTestObject.ts", () => ({
          PathTestObject: mockGameObjectClass,
        }));

        const sceneData = {
          name: "PathTestScene",
          gameObjects: [
            {
              id: "obj1",
              name: "PathTestObject",
              script: "PathTestObject.js", // Note: .js extension
              components: {},
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        // If this succeeds, it means the .js was converted to .ts successfully
        expect(scene.gameObjects).toContain(mockGameObjectInstance);
      });

      it("should handle script loading errors gracefully", async () => {
        const sceneData = {
          name: "ErrorScene",
          gameObjects: [
            {
              id: "obj1",
              name: "NonExistentObject",
              script: "NonExistent.js",
              components: {},
            },
          ] as GameObjectDataJson[],
        };

        // The dynamic import will fail for non-existent modules
        await expect(GameScene.load(sceneData)).rejects.toThrow();
      });
    });

    describe("mixed game objects", () => {
      it("should handle both scripted and non-scripted objects in same scene", async () => {
        const mockComponent = { type: "TransformComponent" };
        const mockConcreteGameObject = { name: "ConcreteObject" };
        const mockScriptedGameObject = { name: "ScriptedObject" };

        (createComponent as ReturnType<typeof vi.fn>).mockReturnValue(mockComponent);
        (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
          mockConcreteGameObject,
        );
        mockGameObjectClass.mockReturnValue(mockScriptedGameObject);

        vi.doMock("../../__Project__/MixedObject.ts", () => ({
          MixedObject: mockGameObjectClass,
        }));

        const sceneData = {
          name: "MixedScene",
          gameObjects: [
            {
              id: "obj1",
              name: "ConcreteObject",
              components: {
                transform: {
                  type: "TransformComponent",
                  name: "transform",
                  initial_values: {},
                },
              },
            },
            {
              id: "obj2",
              name: "MixedObject",
              script: "MixedObject.js",
              components: {},
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(scene.gameObjects).toHaveLength(2);
        expect(scene.gameObjects).toContain(mockConcreteGameObject);
        expect(scene.gameObjects).toContain(mockScriptedGameObject);
      });
    });

    describe("edge cases", () => {
      it("should handle empty gameObjects array", async () => {
        const sceneData = {
          name: "EmptyScene",
          gameObjects: [],
        };

        const scene = await GameScene.load(sceneData);

        expect(scene.gameObjects).toEqual([]);
        expect(scene.components.sprites).toEqual([]);
      });

      it("should handle objects with empty components", async () => {
        (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
          name: "EmptyComponentObject",
        });

        const sceneData = {
          name: "EmptyComponentScene",
          gameObjects: [
            {
              id: "obj1",
              name: "EmptyObject",
              components: {},
            },
          ] as GameObjectDataJson[],
        };

        const scene = await GameScene.load(sceneData);

        expect(ConcreteGameObject).toHaveBeenCalledWith({});
        expect(scene.gameObjects).toHaveLength(1);
      });

      it("should preserve scene name from input data", async () => {
        const testNames = ["Scene1", "My Game Scene", "测试场景", ""];

        for (const name of testNames) {
          const sceneData = {
            name,
            gameObjects: [],
          };

          const scene = await GameScene.load(sceneData);
          expect(scene.name).toBe(name);
        }
      });

      it("should generate unique IDs for each scene", async () => {
        (generateId as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce("SC_111")
          .mockReturnValueOnce("SC_222");

        const sceneData = {
          name: "TestScene",
          gameObjects: [],
        };

        const scene1 = await GameScene.load(sceneData);
        const scene2 = await GameScene.load(sceneData);

        expect(scene1.id).toBe("SC_111");
        expect(scene2.id).toBe("SC_222");
        expect(scene1.id).not.toBe(scene2.id);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should maintain references between components and game objects", async () => {
      const mockSpriteComponent = {
        type: "SpriteComponent",
        id: "sprite1",
      } as unknown as SpriteComponent;
      const mockGameObject = { name: "IntegratedObject" };

      (createComponent as ReturnType<typeof vi.fn>).mockReturnValue(mockSpriteComponent);
      (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockGameObject);

      const sceneData = {
        name: "IntegrationScene",
        gameObjects: [
          {
            id: "obj1",
            name: "IntegratedObject",
            components: {
              sprite: {
                type: "SpriteComponent",
                name: "sprite",
                initial_values: { texture: "test.png", rotation: 0 },
              },
            },
          },
        ] as GameObjectDataJson[],
      };

      const scene = await GameScene.load(sceneData);

      expect(scene.gameObjects).toContain(mockGameObject);
      expect(scene.components.sprites).toContain(mockSpriteComponent);
    });

    it("should handle complex scene with multiple object types and components", async () => {
      const mockTransformComponent = { type: "TransformComponent" };
      const mockSpriteComponent1 = {
        type: "SpriteComponent",
        id: "sprite1",
      } as unknown as SpriteComponent;
      const mockSpriteComponent2 = {
        type: "SpriteComponent",
        id: "sprite2",
      } as unknown as SpriteComponent;
      const mockConcreteObject = { name: "ConcreteObject" };
      const mockScriptedObject = { name: "ScriptedObject", sprite: mockSpriteComponent2 };

      (createComponent as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockTransformComponent)
        .mockReturnValueOnce(mockSpriteComponent1);
      (ConcreteGameObject as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        mockConcreteObject,
      );
      mockGameObjectClass.mockReturnValue(mockScriptedObject);

      vi.doMock("../../__Project__/ComplexObject.ts", () => ({
        ComplexObject: mockGameObjectClass,
      }));

      const sceneData = {
        name: "ComplexScene",
        gameObjects: [
          {
            id: "obj1",
            name: "ConcreteObject",
            components: {
              transform: {
                type: "TransformComponent",
                name: "transform",
                initial_values: {},
              },
              sprite: {
                type: "SpriteComponent",
                name: "sprite",
                initial_values: { texture: "obj1.png", rotation: 0 },
              },
            },
          },
          {
            id: "obj2",
            name: "ComplexObject",
            script: "ComplexObject.js",
            components: {
              sprite: {
                type: "SpriteComponent",
                name: "sprite",
                initial_values: { texture: "obj2.png", rotation: 45 },
              },
            },
          },
        ] as GameObjectDataJson[],
      };

      const scene = await GameScene.load(sceneData);

      expect(scene.gameObjects).toHaveLength(2);
      expect(scene.components.sprites).toHaveLength(2);
      expect(scene.components.sprites).toContain(mockSpriteComponent1);
      expect(scene.components.sprites).toContain(mockSpriteComponent2);
    });
  });
});
