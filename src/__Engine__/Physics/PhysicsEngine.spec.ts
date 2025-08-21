import { type Body, Engine, World } from "matter-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PhysicsEngine } from "./PhysicsEngine";

// Mock Matter.js
vi.mock("matter-js", () => ({
  Engine: {
    create: vi.fn(),
    update: vi.fn(),
  },
  World: {
    add: vi.fn(),
    remove: vi.fn(),
  },
  Bodies: {
    rectangle: vi.fn(),
  },
}));

describe("PhysicsEngine", () => {
  let mockEngine: Matter.Engine;
  let mockWorld: Matter.World;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWorld = {
      bodies: [],
      gravity: { x: 0, y: 1, scale: 0.001 },
    } as unknown as Matter.World;

    mockEngine = {
      world: mockWorld,
      timing: {
        timeScale: 1,
        timestamp: 0,
        lastElapsed: 0,
        lastDelta: 0,
      },
    } as Matter.Engine;

    (Engine.create as ReturnType<typeof vi.fn>).mockReturnValue(mockEngine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create a Matter.js engine", () => {
      const physics = new PhysicsEngine();

      expect(Engine.create).toHaveBeenCalled();
      expect(physics.getEngine()).toBe(mockEngine);
    });

    it("should set gravity when provided", () => {
      const gravity = { x: 0.5, y: 0.8 };
      const physics = new PhysicsEngine({ gravity });

      expect(physics.getEngine().world.gravity.x).toBe(0.5);
      expect(physics.getEngine().world.gravity.y).toBe(0.8);
    });

    it("should use default gravity when not provided", () => {
      const physics = new PhysicsEngine();

      expect(physics.getEngine().world.gravity.x).toBe(0);
      expect(physics.getEngine().world.gravity.y).toBe(1);
    });
  });

  describe("addBody", () => {
    it("should add body to world", () => {
      const physics = new PhysicsEngine();
      const mockBody = { id: 1 } as Body;

      physics.addBody(mockBody);

      expect(World.add).toHaveBeenCalledWith(mockEngine.world, mockBody);
    });
  });

  describe("removeBody", () => {
    it("should remove body from world", () => {
      const physics = new PhysicsEngine();
      const mockBody = { id: 1 } as Body;

      physics.removeBody(mockBody);

      expect(World.remove).toHaveBeenCalledWith(mockEngine.world, mockBody);
    });
  });

  describe("update", () => {
    it("should update engine with deltaTime", () => {
      const physics = new PhysicsEngine();
      const deltaTime = 16.67; // ~60fps

      physics.update(deltaTime);

      expect(Engine.update).toHaveBeenCalledWith(mockEngine, deltaTime);
    });

    it("should handle zero deltaTime", () => {
      const physics = new PhysicsEngine();

      physics.update(0);

      expect(Engine.update).toHaveBeenCalledWith(mockEngine, 0);
    });

    it("should handle large deltaTime", () => {
      const physics = new PhysicsEngine();
      const deltaTime = 1000;

      physics.update(deltaTime);

      expect(Engine.update).toHaveBeenCalledWith(mockEngine, deltaTime);
    });
  });

  describe("setGravity", () => {
    it("should update world gravity", () => {
      const physics = new PhysicsEngine();
      const newGravity = { x: 0.5, y: 0.8 };

      physics.setGravity(newGravity);

      expect(physics.getEngine().world.gravity.x).toBe(0.5);
      expect(physics.getEngine().world.gravity.y).toBe(0.8);
    });
  });

  describe("getEngine", () => {
    it("should return the Matter.js engine instance", () => {
      const physics = new PhysicsEngine();

      expect(physics.getEngine()).toBe(mockEngine);
    });
  });

  describe("getWorld", () => {
    it("should return the Matter.js world", () => {
      const physics = new PhysicsEngine();

      expect(physics.getWorld()).toBe(mockEngine.world);
    });
  });

  describe("getBodies", () => {
    it("should return all bodies in the world", () => {
      const physics = new PhysicsEngine();
      const mockBodies = [{ id: 1 } as Body, { id: 2 } as Body];
      mockEngine.world.bodies = mockBodies;

      expect(physics.getBodies()).toBe(mockBodies);
    });
  });

  describe("destroy", () => {
    it("should have destroy method defined", () => {
      const physics = new PhysicsEngine();

      expect(typeof physics.destroy).toBe("function");
    });

    it("should call destroy without errors", () => {
      const physics = new PhysicsEngine();

      expect(() => physics.destroy()).not.toThrow();
    });

    it("should be callable multiple times without errors", () => {
      const physics = new PhysicsEngine();

      expect(() => {
        physics.destroy();
        physics.destroy();
        physics.destroy();
      }).not.toThrow();
    });
  });
});
