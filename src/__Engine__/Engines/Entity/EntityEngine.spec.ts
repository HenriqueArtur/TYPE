import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "../../EventBus";
import { EntityEngine } from "./EntityEngine";

describe("EntityEngine", () => {
  let entityEngine: EntityEngine;
  let mockEventBus: EventBus;

  beforeEach(() => {
    // Reset EventBus singleton
    (EventBus as unknown as { instance: EventBus | null }).instance = null;
    mockEventBus = EventBus.getInstance();
    vi.spyOn(mockEventBus, "emit");

    entityEngine = new EntityEngine();
  });

  describe("Entity Management", () => {
    it("should create entity with generated ID when no ID provided", () => {
      const entityId = entityEngine.createEntity();

      expect(entityId).toMatch(/^ENT_/);
      expect(mockEventBus.emit).toHaveBeenCalledWith("entity:created", entityId);
    });

    it("should create entity with provided ID", () => {
      const customId = "CUSTOM_ENTITY_123";
      const entityId = entityEngine.createEntity(customId);

      expect(entityId).toBe(customId);
      expect(mockEventBus.emit).toHaveBeenCalledWith("entity:created", customId);
    });

    it("should remove entity and all its components", () => {
      const entityId = entityEngine.createEntity();

      // Register and add a component
      entityEngine.registerComponent("TestComponent", (data) => data);
      entityEngine.addComponent(entityId, "TestComponent", { value: 42 });

      // Verify component exists before removal
      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(true);

      entityEngine.removeEntity(entityId);

      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(false);
      expect(mockEventBus.emit).toHaveBeenCalledWith("entity:removing", entityId, [
        "TestComponent",
      ]);
      expect(mockEventBus.emit).toHaveBeenCalledWith("entity:removed", entityId);
    });

    it("should not crash when removing non-existent entity", () => {
      expect(() => {
        entityEngine.removeEntity("NON_EXISTENT");
      }).not.toThrow();
    });
  });

  describe("Component Registration", () => {
    it("should register component and return this for chaining", () => {
      const factory = (data: Record<string, unknown>) => ({ ...data });
      const result = entityEngine.registerComponent("TestComponent", factory);

      expect(result).toBe(entityEngine);
      expect(entityEngine.getRegisteredComponents()).toContain("TestComponent");
    });

    it("should allow chaining multiple component registrations", () => {
      const factory1 = (data: Record<string, unknown>) => ({ ...data });
      const factory2 = (data: Record<string, unknown>) => ({ ...data });

      entityEngine
        .registerComponent("Component1", factory1)
        .registerComponent("Component2", factory2);

      const registered = entityEngine.getRegisteredComponents();
      expect(registered).toContain("Component1");
      expect(registered).toContain("Component2");
    });

    it("should return empty array when no components registered", () => {
      expect(entityEngine.getRegisteredComponents()).toEqual([]);
    });
  });

  describe("Component Management", () => {
    let entityId: string;

    beforeEach(() => {
      entityId = entityEngine.createEntity();
      entityEngine.registerComponent("TestComponent", (data) => data);
    });

    it("should add component to entity", () => {
      const componentData = { value: 42 };

      entityEngine.addComponent(entityId, "TestComponent", componentData);

      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(true);
      expect(entityEngine.getComponent(entityId, "TestComponent")).toEqual(componentData);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "component:added",
        entityId,
        "TestComponent",
        componentData,
      );
    });

    it("should throw error when adding component to non-existent entity", () => {
      expect(() => {
        entityEngine.addComponent("NON_EXISTENT", "TestComponent", { value: 42 });
      }).toThrow("Entity with ID NON_EXISTENT does not exist");
    });

    it("should throw error when adding unregistered component", () => {
      expect(() => {
        entityEngine.addComponent(entityId, "UnregisteredComponent", { value: 42 });
      }).toThrow("Component UnregisteredComponent is not registered");
    });

    it("should remove component from entity", () => {
      const componentData = { value: 42 };
      entityEngine.addComponent(entityId, "TestComponent", componentData);

      entityEngine.removeComponent(entityId, "TestComponent");

      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(false);
      expect(entityEngine.getComponent(entityId, "TestComponent")).toBeUndefined();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "component:removed",
        entityId,
        "TestComponent",
        componentData,
      );
    });

    it("should return undefined for non-existent component", () => {
      expect(entityEngine.getComponent(entityId, "NonExistent")).toBeUndefined();
      expect(entityEngine.hasComponent(entityId, "NonExistent")).toBe(false);
    });
  });

  describe("Entity Querying", () => {
    let entity1: string;
    let entity2: string;
    let entity3: string;

    beforeEach(() => {
      entity1 = entityEngine.createEntity();
      entity2 = entityEngine.createEntity();
      entity3 = entityEngine.createEntity();

      entityEngine.registerComponent("Position", (data) => data);
      entityEngine.registerComponent("Velocity", (data) => data);
      entityEngine.registerComponent("Sprite", (data) => data);

      // Entity1: Position + Velocity
      entityEngine.addComponent(entity1, "Position", { x: 10, y: 20 });
      entityEngine.addComponent(entity1, "Velocity", { dx: 1, dy: 2 });

      // Entity2: Position + Sprite
      entityEngine.addComponent(entity2, "Position", { x: 30, y: 40 });
      entityEngine.addComponent(entity2, "Sprite", { texture: "player.png" });

      // Entity3: Position + Velocity + Sprite
      entityEngine.addComponent(entity3, "Position", { x: 50, y: 60 });
      entityEngine.addComponent(entity3, "Velocity", { dx: 3, dy: 4 });
      entityEngine.addComponent(entity3, "Sprite", { texture: "enemy.png" });
    });

    it("should query entities with all specified components", () => {
      const results = entityEngine.queryEntities(["Position", "Velocity"]);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.entityId)).toContain(entity1);
      expect(results.map((r) => r.entityId)).toContain(entity3);
      expect(results.map((r) => r.entityId)).not.toContain(entity2);

      // Check that components are properly included
      const entity1Result = results.find((r) => r.entityId === entity1);
      expect(entity1Result?.components.Position).toEqual({ x: 10, y: 20 });
      expect(entity1Result?.components.Velocity).toEqual({ dx: 1, dy: 2 });
    });

    it("should query entities with any specified components", () => {
      const results = entityEngine.queryEntitiesWithAny(["Velocity", "Sprite"]);

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.entityId)).toContain(entity1);
      expect(results.map((r) => r.entityId)).toContain(entity2);
      expect(results.map((r) => r.entityId)).toContain(entity3);

      // Check that only matching components are included
      const entity2Result = results.find((r) => r.entityId === entity2);
      expect(entity2Result?.components.Sprite).toEqual({ texture: "player.png" });
      expect(entity2Result?.components.Velocity).toBeUndefined();
    });

    it("should return empty array when no entities match query", () => {
      entityEngine.registerComponent("NonExistent", (data) => data);
      const results = entityEngine.queryEntities(["NonExistent"]);

      expect(results).toHaveLength(0);
    });
  });
});
