import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mouse } from "./InputDevices/Mouse";
import type { PhysicsWorldManager } from "./Physics";
import type { GameScene } from "./Scene";
import { TypeEngine } from "./TypeEngine";
import type { CollisionManager } from "./Utils/CollisionManager";

describe("TypeEngine", () => {
  beforeEach(() => {
    // Reset singleton instance before each test
    TypeEngine.resetInstance();
  });

  describe("singleton pattern", () => {
    it("should return the same instance when getInstance is called multiple times", () => {
      const instance1 = TypeEngine.getInstance();
      const instance2 = TypeEngine.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create a new instance after reset", () => {
      const instance1 = TypeEngine.getInstance();
      TypeEngine.resetInstance();
      const instance2 = TypeEngine.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe("scene management", () => {
    it("should start with no current scene", () => {
      const engine = TypeEngine.getInstance();

      expect(engine.getCurrentScene()).toBeNull();
    });

    it("should load and set current scene", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();

      engine.loadScene(mockScene);

      expect(engine.getCurrentScene()).toBe(mockScene);
    });

    it("should replace current scene when loading a new one", () => {
      const engine = TypeEngine.getInstance();
      const scene1 = createMockScene();
      const scene2 = createMockScene();

      engine.loadScene(scene1);
      engine.loadScene(scene2);

      expect(engine.getCurrentScene()).toBe(scene2);
      expect(engine.getCurrentScene()).not.toBe(scene1);
    });
  });

  describe("game update", () => {
    it("should not crash when updating with no scene", () => {
      const engine = TypeEngine.getInstance();

      expect(() => engine.update(16.67)).not.toThrow();
    });

    it("should update current scene when scene is loaded", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      engine.loadScene(mockScene);

      engine.update(16.67);

      expect(mockScene.update).toHaveBeenCalledWith(16.67);
    });

    it("should pass deltaTime to scene update", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      engine.loadScene(mockScene);
      const deltaTime = 33.33;

      engine.update(deltaTime);

      expect(mockScene.update).toHaveBeenCalledWith(deltaTime);
    });
  });

  describe("physics access", () => {
    it("should return null physics manager when no scene is loaded", () => {
      const engine = TypeEngine.getInstance();

      expect(engine.getPhysicsManager()).toBeNull();
    });

    it("should return physics manager from current scene", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      engine.loadScene(mockScene);

      const physicsManager = engine.getPhysicsManager();

      expect(physicsManager).toBe(mockScene.physicsWorldManager);
    });
  });

  describe("game loop", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Mock requestAnimationFrame and cancelAnimationFrame for the test environment
      Object.assign(globalThis, {
        requestAnimationFrame: vi.fn(),
        cancelAnimationFrame: vi.fn(),
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("should start game loop and call requestAnimationFrame", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      const mockUpdateCallback = vi.fn();
      engine.loadScene(mockScene);

      const requestAnimationFrameSpy = vi
        .spyOn(global, "requestAnimationFrame")
        .mockImplementation(() => 1);

      engine.startGameLoop(mockUpdateCallback);

      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });

    it("should call update callback in game loop", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      const mockUpdateCallback = vi.fn();
      engine.loadScene(mockScene);

      let gameLoopCallback: FrameRequestCallback | undefined;
      vi.spyOn(global, "requestAnimationFrame").mockImplementation((callback) => {
        gameLoopCallback = callback;
        return 1;
      });

      engine.startGameLoop(mockUpdateCallback);

      // Simulate frame callback
      expect(gameLoopCallback).toBeDefined();
      gameLoopCallback?.(16.67);

      expect(mockUpdateCallback).toHaveBeenCalledWith(16.67);
    });

    it("should update scene and game objects in game loop", () => {
      const engine = TypeEngine.getInstance();
      const mockGameObject = { update: vi.fn() };
      const mockMouse = { position: { x: 0, y: 0 } } as Mouse;
      const mockScene = createMockScene();
      // Override the readonly property for testing
      Object.defineProperty(mockScene, "gameObjects", {
        value: [mockGameObject],
        writable: true,
        configurable: true,
      });
      engine.loadScene(mockScene);

      let gameLoopCallback: FrameRequestCallback | undefined;
      vi.spyOn(global, "requestAnimationFrame").mockImplementation((callback) => {
        gameLoopCallback = callback;
        return 1;
      });

      engine.startGameLoop(() => {}, mockMouse);

      // Simulate frame callback
      expect(gameLoopCallback).toBeDefined();
      gameLoopCallback?.(16.67);

      expect(mockGameObject.update).toHaveBeenCalledWith({ deltaTime: 16.67, mouse: mockMouse });
      expect(mockScene.update).toHaveBeenCalledWith(16.67);
    });

    it("should stop game loop when requested", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      engine.loadScene(mockScene);

      const cancelAnimationFrameSpy = vi
        .spyOn(global, "cancelAnimationFrame")
        .mockImplementation(() => {});
      vi.spyOn(global, "requestAnimationFrame").mockReturnValue(123);

      engine.startGameLoop(() => {});
      engine.stopGameLoop();

      expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(123);
    });

    it("should not crash when updating with no scene loaded", () => {
      const engine = TypeEngine.getInstance();
      const mockUpdateCallback = vi.fn();

      let gameLoopCallback: FrameRequestCallback | undefined;
      vi.spyOn(global, "requestAnimationFrame").mockImplementation((callback) => {
        gameLoopCallback = callback;
        return 1;
      });

      engine.startGameLoop(mockUpdateCallback);

      expect(gameLoopCallback).toBeDefined();
      expect(() => gameLoopCallback?.(16.67)).not.toThrow();
      expect(mockUpdateCallback).toHaveBeenCalledWith(16.67);
    });

    it("should calculate delta time correctly", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      const mockUpdateCallback = vi.fn();
      engine.loadScene(mockScene);

      let gameLoopCallback: FrameRequestCallback | undefined;
      vi.spyOn(global, "requestAnimationFrame").mockImplementation((callback) => {
        gameLoopCallback = callback;
        return 1;
      });

      engine.startGameLoop(mockUpdateCallback);

      expect(gameLoopCallback).toBeDefined();

      // First frame
      gameLoopCallback?.(0);
      expect(mockUpdateCallback).toHaveBeenCalledWith(0);

      // Second frame
      gameLoopCallback?.(16.67);
      expect(mockUpdateCallback).toHaveBeenCalledWith(16.67);

      // Third frame
      gameLoopCallback?.(33.34);
      expect(mockUpdateCallback).toHaveBeenCalledWith(16.67);
    });
  });

  describe("cleanup", () => {
    it("should handle destroy when no scene is loaded", () => {
      const engine = TypeEngine.getInstance();

      expect(() => engine.destroy()).not.toThrow();
    });

    it("should clear current scene on destroy", () => {
      const engine = TypeEngine.getInstance();
      const mockScene = createMockScene();
      engine.loadScene(mockScene);

      engine.destroy();

      expect(engine.getCurrentScene()).toBeNull();
    });

    it("should stop game loop on destroy", () => {
      const engine = TypeEngine.getInstance();
      const stopGameLoopSpy = vi.spyOn(engine, "stopGameLoop");

      engine.destroy();

      expect(stopGameLoopSpy).toHaveBeenCalled();
    });
  });
});

function createMockScene(): GameScene {
  const mockCollisionManager = {} as CollisionManager;
  const mockPhysicsWorldManager = {} as PhysicsWorldManager;

  return {
    id: "test-scene",
    name: "Test Scene",
    gameObjects: [],
    components: { sprites: [], bodies: [] },
    collisionManager: mockCollisionManager,
    physicsWorldManager: mockPhysicsWorldManager,
    update: vi.fn(),
  } as GameScene;
}
