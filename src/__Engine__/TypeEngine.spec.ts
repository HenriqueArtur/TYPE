/** biome-ignore-all lint/complexity/useLiteralKeys: false positive */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "./EventBus";
import type { System } from "./Systems/System";
import { TypeEngine } from "./TypeEngine";

describe("TypeEngine", () => {
  beforeEach(() => {
    TypeEngine.resetInstance();
    EventBus.resetInstance();
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

  describe("ECS initialization", () => {
    it("should initialize with empty entities map", () => {
      const engine = TypeEngine.getInstance();

      expect(engine["entities"]).toBeInstanceOf(Map);
      expect(engine["entities"].size).toBe(0);
    });

    it("should initialize with empty components map", () => {
      const engine = TypeEngine.getInstance();

      expect(engine["components"]).toBeInstanceOf(Map);
      expect(engine["components"].size).toBe(0);
    });

    it("should initialize with empty systems array", () => {
      const engine = TypeEngine.getInstance();

      expect(Array.isArray(engine["systems"])).toBe(true);
      expect(engine["systems"].length).toBe(0);
    });

    it("should initialize with isRunning as false", () => {
      const engine = TypeEngine.getInstance();

      expect(engine["isRunning"]).toBe(false);
    });

    it("should initialize with empty componentFactories map", () => {
      const engine = TypeEngine.getInstance();

      expect(engine["componentFactories"]).toBeInstanceOf(Map);
      expect(engine["componentFactories"].size).toBe(0);
    });
  });

  describe("entity management", () => {
    it("should create entity with generated ID when no ID provided", () => {
      const engine = TypeEngine.getInstance();

      const entityId = engine.createEntity();

      expect(typeof entityId).toBe("string");
      expect(entityId).toMatch(/^ENT_/);
      expect(engine["entities"].has(entityId)).toBe(true);
      expect(engine["entities"].get(entityId)).toBeInstanceOf(Set);
    });

    it("should create entity with provided ID", () => {
      const engine = TypeEngine.getInstance();
      const customId = "custom-entity-id";

      const entityId = engine.createEntity(customId);

      expect(entityId).toBe(customId);
      expect(engine["entities"].has(customId)).toBe(true);
      expect(engine["entities"].get(customId)).toBeInstanceOf(Set);
    });

    it("should create multiple entities with unique IDs", () => {
      const engine = TypeEngine.getInstance();

      const entity1 = engine.createEntity();
      const entity2 = engine.createEntity();
      const entity3 = engine.createEntity("custom-id");

      expect(entity1).not.toBe(entity2);
      expect(entity1).not.toBe(entity3);
      expect(entity2).not.toBe(entity3);
      expect(engine["entities"].size).toBe(3);
    });

    it("should remove entity and all its components", () => {
      const engine = TypeEngine.getInstance();
      const mockComponent = vi.fn();

      engine.registerComponent("Position", mockComponent);
      const entityId = engine.createEntity();
      engine.addComponent(entityId, "Position", { x: 10, y: 20 });

      engine.removeEntity(entityId);

      expect(engine["entities"].has(entityId)).toBe(false);
      expect(engine.getComponent(entityId, "Position")).toBeUndefined();
    });

    it("should not crash when removing non-existent entity", () => {
      const engine = TypeEngine.getInstance();

      expect(() => engine.removeEntity("non-existent")).not.toThrow();
    });
  });

  describe("component registration", () => {
    it("should register component and return this for chaining", () => {
      const engine = TypeEngine.getInstance();
      const mockComponent = vi.fn();

      const result = engine.registerComponent("TestComponent", mockComponent);

      expect(result).toBe(engine);
      expect(engine["componentFactories"].has("TestComponent")).toBe(true);
      expect(engine["componentFactories"].get("TestComponent")).toBe(mockComponent);
    });

    it("should create component map when registering component", () => {
      const engine = TypeEngine.getInstance();
      const mockComponent = vi.fn();

      engine.registerComponent("TestComponent", mockComponent);

      expect(engine["components"].has("TestComponent")).toBe(true);
      expect(engine["components"].get("TestComponent")).toBeInstanceOf(Map);
    });

    it("should allow chaining multiple component registrations", () => {
      const engine = TypeEngine.getInstance();
      const component1 = vi.fn();
      const component2 = vi.fn();
      const component3 = vi.fn();

      const result = engine
        .registerComponent("Component1", component1)
        .registerComponent("Component2", component2)
        .registerComponent("Component3", component3);

      expect(result).toBe(engine);
      expect(engine["componentFactories"].size).toBe(3);
      expect(engine["components"].size).toBe(3);
    });

    it("should get registered components", () => {
      const engine = TypeEngine.getInstance();
      const component1 = vi.fn();
      const component2 = vi.fn();

      engine.registerComponent("Position", component1).registerComponent("Velocity", component2);

      const registeredComponents = engine.getRegisteredComponents();

      expect(registeredComponents).toEqual(["Position", "Velocity"]);
    });

    it("should return empty array when no components registered", () => {
      const engine = TypeEngine.getInstance();

      const registeredComponents = engine.getRegisteredComponents();

      expect(registeredComponents).toEqual([]);
    });
  });

  describe("component management", () => {
    beforeEach(() => {
      const engine = TypeEngine.getInstance();
      const mockComponent = vi.fn();
      engine.registerComponent("Position", mockComponent);
      engine.registerComponent("Velocity", mockComponent);
    });

    it("should add component to entity", () => {
      const engine = TypeEngine.getInstance();
      const entityId = engine.createEntity();
      const position = { x: 10, y: 20 };

      engine.addComponent(entityId, "Position", position);

      expect(engine.getComponent(entityId, "Position")).toEqual(position);
      expect(engine.hasComponent(entityId, "Position")).toBe(true);
    });

    it("should throw error when adding component to non-existent entity", () => {
      const engine = TypeEngine.getInstance();

      expect(() => {
        engine.addComponent("non-existent", "Position", { x: 10, y: 20 });
      }).toThrow("Entity with ID non-existent does not exist");
    });

    it("should throw error when adding unregistered component", () => {
      const engine = TypeEngine.getInstance();
      const entityId = engine.createEntity();

      expect(() => {
        engine.addComponent(entityId, "Unregistered", {});
      }).toThrow("Component Unregistered is not registered");
    });

    it("should remove component from entity", () => {
      const engine = TypeEngine.getInstance();
      const entityId = engine.createEntity();

      engine.addComponent(entityId, "Position", { x: 10, y: 20 });
      engine.removeComponent(entityId, "Position");

      expect(engine.getComponent(entityId, "Position")).toBeUndefined();
      expect(engine.hasComponent(entityId, "Position")).toBe(false);
    });

    it("should return undefined for non-existent component", () => {
      const engine = TypeEngine.getInstance();
      const entityId = engine.createEntity();

      expect(engine.getComponent(entityId, "Position")).toBeUndefined();
      expect(engine.hasComponent(entityId, "Position")).toBe(false);
    });
  });

  describe("system management", () => {
    it("should add system and sort by priority", () => {
      const engine = TypeEngine.getInstance();
      const system1: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };
      const system2: System<TypeEngine> = {
        priority: 5,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };

      engine.addSystem(system1);
      engine.addSystem(system2);

      expect(engine["systems"]).toEqual([system2, system1]);
      expect(system1.init).toHaveBeenCalledWith(engine);
      expect(system2.init).toHaveBeenCalledWith(engine);
    });

    it("should remove system and call destroy", () => {
      const engine = TypeEngine.getInstance();
      const system: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
        destroy: vi.fn(),
      };

      engine.addSystem(system);
      engine.removeSystem(system);

      expect(engine["systems"].length).toBe(0);
      expect(system.destroy).toHaveBeenCalledWith(engine);
    });

    it("should toggle system enabled state", () => {
      const engine = TypeEngine.getInstance();
      const system: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };

      engine.addSystem(system);
      engine.systemToggle(system);

      expect(system.enabled).toBe(false);

      engine.systemToggle(system);
      expect(system.enabled).toBe(true);
    });
  });

  describe("entity querying", () => {
    beforeEach(() => {
      const engine = TypeEngine.getInstance();
      const mockComponent = vi.fn();
      engine.registerComponent("Position", mockComponent);
      engine.registerComponent("Velocity", mockComponent);
      engine.registerComponent("Health", mockComponent);
    });

    it("should query entities with all specified components", () => {
      const engine = TypeEngine.getInstance();
      const entity1 = engine.createEntity();
      const entity2 = engine.createEntity();
      const entity3 = engine.createEntity();

      engine.addComponent(entity1, "Position", { x: 10, y: 20 });
      engine.addComponent(entity1, "Velocity", { dx: 1, dy: 2 });

      engine.addComponent(entity2, "Position", { x: 30, y: 40 });

      engine.addComponent(entity3, "Position", { x: 50, y: 60 });
      engine.addComponent(entity3, "Velocity", { dx: 3, dy: 4 });

      const result = engine.queryEntities(["Position", "Velocity"]);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.entityId)).toContain(entity1);
      expect(result.map((r) => r.entityId)).toContain(entity3);
      expect(result.map((r) => r.entityId)).not.toContain(entity2);
    });

    it("should query entities with any specified components", () => {
      const engine = TypeEngine.getInstance();
      const entity1 = engine.createEntity();
      const entity2 = engine.createEntity();

      engine.addComponent(entity1, "Position", { x: 10, y: 20 });
      engine.addComponent(entity2, "Velocity", { dx: 1, dy: 2 });

      const result = engine.queryEntitiesWithAny(["Position", "Health"]);

      expect(result).toHaveLength(1);
      expect(result[0].entityId).toBe(entity1);
    });
  });

  describe("engine lifecycle", () => {
    it("should start and stop engine", () => {
      const engine = TypeEngine.getInstance();

      expect(engine["isRunning"]).toBe(false);

      engine.start();
      expect(engine["isRunning"]).toBe(true);

      engine.stop();
      expect(engine["isRunning"]).toBe(false);
    });

    it("should update enabled systems when running", () => {
      const engine = TypeEngine.getInstance();
      const system1: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };
      const system2: System<TypeEngine> = {
        priority: 5,
        enabled: false,
        init: vi.fn(),
        update: vi.fn(),
      };

      engine.addSystem(system1);
      engine.addSystem(system2);
      engine.start();

      engine.update(16.67);

      expect(system1.update).toHaveBeenCalledWith(engine, 16.67);
      expect(system2.update).not.toHaveBeenCalled();
    });

    it("should not update systems when engine is stopped", () => {
      const engine = TypeEngine.getInstance();
      const system: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };

      engine.addSystem(system);
      engine.stop();

      engine.update(16.67);

      expect(system.update).not.toHaveBeenCalled();
    });
  });

  describe("EventBus integration", () => {
    it("should provide access to EventBus", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();

      expect(eventBus).toBeInstanceOf(EventBus);
      expect(eventBus).toBe(EventBus.getInstance());
    });

    it("should emit entity creation events", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();
      const listener = vi.fn();

      eventBus.on("entity:created", listener);
      const entityId = engine.createEntity();

      expect(listener).toHaveBeenCalledWith(entityId);
    });

    it("should emit entity removal events", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();
      const removingListener = vi.fn();
      const removedListener = vi.fn();

      eventBus.on("entity:removing", removingListener);
      eventBus.on("entity:removed", removedListener);

      const entityId = engine.createEntity();
      engine.removeEntity(entityId);

      expect(removingListener).toHaveBeenCalledWith(entityId, []);
      expect(removedListener).toHaveBeenCalledWith(entityId);
    });

    it("should emit component events", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();
      const addedListener = vi.fn();
      const removedListener = vi.fn();
      const mockComponent = vi.fn();

      engine.registerComponent("Position", mockComponent);
      eventBus.on("component:added", addedListener);
      eventBus.on("component:removed", removedListener);

      const entityId = engine.createEntity();
      const componentData = { x: 10, y: 20 };

      engine.addComponent(entityId, "Position", componentData);
      expect(addedListener).toHaveBeenCalledWith(entityId, "Position", componentData);

      engine.removeComponent(entityId, "Position");
      expect(removedListener).toHaveBeenCalledWith(entityId, "Position", componentData);
    });

    it("should emit engine update events", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();
      const startListener = vi.fn();
      const endListener = vi.fn();

      eventBus.on("engine:update:start", startListener);
      eventBus.on("engine:update:end", endListener);

      engine.start();
      engine.update(16.67);

      expect(startListener).toHaveBeenCalledWith(16.67);
      expect(endListener).toHaveBeenCalledWith(16.67);
    });

    it("should emit system update events", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();
      const startListener = vi.fn();
      const endListener = vi.fn();
      const system: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };

      eventBus.on("system:update:start", startListener);
      eventBus.on("system:update:end", endListener);

      engine.addSystem(system);
      engine.start();
      engine.update(16.67);

      expect(startListener).toHaveBeenCalledWith(system, 16.67);
      expect(endListener).toHaveBeenCalledWith(system, 16.67);
    });

    it("should process queued events during update", () => {
      const engine = TypeEngine.getInstance();
      const eventBus = engine.getEventBus();
      const listener = vi.fn();

      eventBus.on("test:event", listener);
      eventBus.emit("test:event", "queued-data");

      engine.start();
      engine.update(16.67);

      expect(listener).toHaveBeenCalledWith("queued-data");
    });
  });
});
