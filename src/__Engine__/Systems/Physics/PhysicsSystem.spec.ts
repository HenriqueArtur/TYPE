import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PhysicsEngine } from "../../Engines/Physics/PhysicsEngine";
import type { TypeEngine } from "../../TypeEngine";
import { PhysicsSystem } from "./PhysicsSystem";

describe("PhysicsSystem", () => {
  let physics_system: PhysicsSystem;
  let mock_engine: TypeEngine;
  let mock_physics_engine: PhysicsEngine;

  beforeEach(() => {
    mock_physics_engine = {
      update: vi.fn(),
    } as unknown as PhysicsEngine;

    mock_engine = {
      getPhysicsEngine: vi.fn().mockReturnValue(mock_physics_engine),
    } as unknown as TypeEngine;

    physics_system = new PhysicsSystem();
  });

  describe("initialization", () => {
    it("should have correct priority and enabled state", () => {
      expect(physics_system.priority).toBe(1);
      expect(physics_system.enabled).toBe(true);
    });
  });

  describe("init", () => {
    it("should initialize without error", async () => {
      await expect(physics_system.init(mock_engine)).resolves.not.toThrow();
    });
  });

  describe("update", () => {
    it("should update physics engine with deltaTime", () => {
      physics_system.update(mock_engine, 16.67);

      expect(mock_physics_engine.update).toHaveBeenCalledWith(16.67);
    });
  });

  describe("destroy", () => {
    it("should destroy without error", () => {
      expect(() => physics_system.destroy(mock_engine)).not.toThrow();
    });
  });
});
