import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RectangularBodyComponent } from "../Component/Physics/RectangularBodyComponent";
import { PhysicsEngine } from "./PhysicsEngine";
import { PhysicsWorldManager } from "./PhysicsWorldManager";

// Mock PhysicsEngine
vi.mock("./PhysicsEngine");

describe("PhysicsWorldManager", () => {
  let mockPhysicsEngine: PhysicsEngine;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPhysicsEngine = {
      addBody: vi.fn(),
      removeBody: vi.fn(),
      update: vi.fn(),
      setGravity: vi.fn(),
      getEngine: vi.fn(),
      getWorld: vi.fn(),
      getBodies: vi.fn(),
      destroy: vi.fn(),
    } as unknown as PhysicsEngine;

    (PhysicsEngine as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockPhysicsEngine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create a PhysicsEngine instance", () => {
      const manager = new PhysicsWorldManager();

      expect(PhysicsEngine).toHaveBeenCalled();
      expect(manager.getEngine()).toBe(mockPhysicsEngine);
    });

    it("should pass gravity options to PhysicsEngine", () => {
      const options = { gravity: { x: 0.1, y: 0.9 } };
      new PhysicsWorldManager(options);

      expect(PhysicsEngine).toHaveBeenCalledWith(options);
    });
  });

  describe("addBodyComponent", () => {
    it("should add body to physics engine", () => {
      const manager = new PhysicsWorldManager();
      const mockBodyComponent: Partial<RectangularBodyComponent> = {
        getBody: vi.fn().mockReturnValue({ id: 1 }),
      };

      manager.addBodyComponent(mockBodyComponent as RectangularBodyComponent);

      expect(mockBodyComponent.getBody).toHaveBeenCalled();
      expect(mockPhysicsEngine.addBody).toHaveBeenCalledWith({ id: 1 });
    });

    it("should track added body components", () => {
      const manager = new PhysicsWorldManager();
      const mockBodyComponent: Partial<RectangularBodyComponent> = {
        getBody: vi.fn().mockReturnValue({ id: 1 }),
      };

      manager.addBodyComponent(mockBodyComponent as RectangularBodyComponent);

      expect(manager.getBodyComponents()).toContain(mockBodyComponent);
    });
  });

  describe("removeBodyComponent", () => {
    it("should remove body from physics engine", () => {
      const manager = new PhysicsWorldManager();
      const mockBodyComponent: Partial<RectangularBodyComponent> = {
        getBody: vi.fn().mockReturnValue({ id: 1 }),
      };

      manager.addBodyComponent(mockBodyComponent as RectangularBodyComponent);
      manager.removeBodyComponent(mockBodyComponent as RectangularBodyComponent);

      expect(mockPhysicsEngine.removeBody).toHaveBeenCalledWith({ id: 1 });
    });

    it("should stop tracking removed body components", () => {
      const manager = new PhysicsWorldManager();
      const mockBodyComponent: Partial<RectangularBodyComponent> = {
        getBody: vi.fn().mockReturnValue({ id: 1 }),
      };

      manager.addBodyComponent(mockBodyComponent as RectangularBodyComponent);
      manager.removeBodyComponent(mockBodyComponent as RectangularBodyComponent);

      expect(manager.getBodyComponents()).not.toContain(mockBodyComponent);
    });

    it("should handle removing non-existent body component", () => {
      const manager = new PhysicsWorldManager();
      const mockBodyComponent: Partial<RectangularBodyComponent> = {
        getBody: vi.fn().mockReturnValue({ id: 1 }),
      };

      expect(() => {
        manager.removeBodyComponent(mockBodyComponent as RectangularBodyComponent);
      }).not.toThrow();
    });
  });

  describe("update", () => {
    it("should update physics engine", () => {
      const manager = new PhysicsWorldManager();
      const deltaTime = 16.67;

      manager.update(deltaTime);

      expect(mockPhysicsEngine.update).toHaveBeenCalledWith(deltaTime);
    });
  });

  describe("destroy", () => {
    it("should destroy physics engine", () => {
      const manager = new PhysicsWorldManager();

      manager.destroy();

      expect(mockPhysicsEngine.destroy).toHaveBeenCalled();
    });

    it("should clear all body components", () => {
      const manager = new PhysicsWorldManager();
      const mockBodyComponent: Partial<RectangularBodyComponent> = {
        getBody: vi.fn().mockReturnValue({ id: 1 }),
      };

      manager.addBodyComponent(mockBodyComponent as RectangularBodyComponent);
      manager.destroy();

      expect(manager.getBodyComponents()).toHaveLength(0);
    });
  });
});
