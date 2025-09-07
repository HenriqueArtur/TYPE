import { beforeEach, describe, expect, it, vi } from "vitest";
import { TypeEngine } from "../../TypeEngine";
import { setupBasicTypeEngineMocks } from "../../TyprEngine.mock";
import type { EntityEngine } from "./EntityEngine";

describe("EntityEngine", () => {
  let typeEngine: TypeEngine;
  let entityEngine: EntityEngine;

  beforeEach(async () => {
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

    setupBasicTypeEngineMocks(typeEngine);

    await typeEngine.setup();
    entityEngine = typeEngine.EntityEngine;

    vi.spyOn(typeEngine.EventEngine, "emit");
  });

  describe("Entity Management", () => {
    it("should create entity with generated ID when no ID provided", () => {
      const entityId = entityEngine.create();

      expect(entityId).toMatch(/^ENT_/);
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("entity:created", entityId);
    });

    it("should create entity with provided ID", () => {
      const customId = "CUSTOM_ENTITY_123";
      const entityId = entityEngine.create(customId);

      expect(entityId).toBe(customId);
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("entity:created", customId);
    });

    it("should remove entity and all its components", () => {
      const entityId = entityEngine.create();

      // Register and add a component
      entityEngine.registerComponent("TestComponent", (data) => data);
      entityEngine.addComponent(entityId, "TestComponent", { value: 42 });

      // Verify component exists before removal
      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(true);

      entityEngine.remove(entityId);

      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(false);
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("entity:removing", entityId, [
        "TestComponent",
      ]);
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("entity:removed", entityId);
    });

    it("should not crash when removing non-existent entity", () => {
      expect(() => {
        entityEngine.remove("NON_EXISTENT");
      }).not.toThrow();
    });

    it("should get entity by ID with all its components", () => {
      const entityId = entityEngine.create();

      // Register and add multiple components
      entityEngine.registerComponent("TestComponent1", (data) => data);
      entityEngine.registerComponent("TestComponent2", (data) => data);

      entityEngine.addComponent(entityId, "TestComponent1", { value: 42 });
      entityEngine.addComponent(entityId, "TestComponent2", { name: "test" });

      const entity = entityEngine.get(entityId);

      expect(entity).toBeDefined();
      expect(entity?.entityId).toBe(entityId);
      expect(entity?.components).toEqual({
        TestComponent1: [{ value: 42 }],
        TestComponent2: [{ name: "test" }],
      });
    });

    it("should return undefined for non-existent entity", () => {
      const entity = entityEngine.get("NON_EXISTENT");

      expect(entity).toBeUndefined();
    });
  });

  describe("Component Registration", () => {
    it("should register component and return this for chaining", () => {
      const factory = (...args: unknown[]) => ({ ...args });
      const result = entityEngine.registerComponent("TestComponent", factory);

      expect(result).toBe(entityEngine);
      expect(entityEngine.getRegisteredComponents()).toContain("TestComponent");
    });

    it("should allow chaining multiple component registrations", () => {
      const factory1 = (...args: unknown[]) => ({ ...args });
      const factory2 = (...args: unknown[]) => ({ ...args });

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
      entityId = entityEngine.create();
      entityEngine.registerComponent("TestComponent", (data) => data);
    });

    it("should add component to entity", () => {
      const componentData = { value: 42 };

      entityEngine.addComponent(entityId, "TestComponent", componentData);

      expect(entityEngine.hasComponent(entityId, "TestComponent")).toBe(true);
      expect(entityEngine.getComponent(entityId, "TestComponent")).toEqual([componentData]);
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
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
      expect(entityEngine.getComponent(entityId, "TestComponent")).toEqual([]);
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
        "component:removed",
        entityId,
        "TestComponent",
        componentData,
      );
    });

    it("should return empty array for non-existent component", () => {
      expect(entityEngine.getComponent(entityId, "NonExistent")).toEqual([]);
      expect(entityEngine.hasComponent(entityId, "NonExistent")).toBe(false);
    });
  });

  describe("Entity Querying", () => {
    let entity1: string;
    let entity2: string;
    let entity3: string;

    beforeEach(() => {
      entity1 = entityEngine.create();
      entity2 = entityEngine.create();
      entity3 = entityEngine.create();

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
      const results = entityEngine.query(["Position", "Velocity"]);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.entityId)).toContain(entity1);
      expect(results.map((r) => r.entityId)).toContain(entity3);
      expect(results.map((r) => r.entityId)).not.toContain(entity2);

      // Check that components are properly included
      const entity1Result = results.find((r) => r.entityId === entity1);
      expect(entity1Result?.components.Position).toEqual([{ x: 10, y: 20 }]);
      expect(entity1Result?.components.Velocity).toEqual([{ dx: 1, dy: 2 }]);
    });

    it("should query entities with any specified components", () => {
      const results = entityEngine.queryWithAny(["Velocity", "Sprite"]);

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.entityId)).toContain(entity1);
      expect(results.map((r) => r.entityId)).toContain(entity2);
      expect(results.map((r) => r.entityId)).toContain(entity3);

      // Check that only matching components are included
      const entity2Result = results.find((r) => r.entityId === entity2);
      expect(entity2Result?.components.Sprite).toEqual([{ texture: "player.png" }]);
      expect(entity2Result?.components.Velocity).toBeUndefined();
    });

    it("should return empty array when no entities match query", () => {
      entityEngine.registerComponent("NonExistent", (data) => data);
      const results = entityEngine.query(["NonExistent"]);

      expect(results).toHaveLength(0);
    });
  });

  describe("Physics and Drawable Event Management", () => {
    let entityId: string;

    beforeEach(() => {
      entityId = entityEngine.create();

      // Register components with physics and drawable markers
      entityEngine.registerComponent("PhysicsBody", (data) => ({ ...data, _body: true }));
      entityEngine.registerComponent("DrawableSprite", (data) => ({ ...data, _drawable: true }));
      entityEngine.registerComponent("RegularComponent", (data) => data);

      // Reset event spy to ignore setup events
      vi.clearAllMocks();
    });

    describe("addComponent events", () => {
      it("should emit 'physics:add:body' event when adding physics component", () => {
        const bodyData = { x: 10, y: 20, mass: 5 };

        const result = entityEngine.addComponent(entityId, "PhysicsBody", bodyData);

        // Should emit component:added event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "component:added",
          entityId,
          "PhysicsBody",
          bodyData,
        );

        // Should emit physics:add:body event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "physics:add:body",
          entityId,
          result.componentId,
          { ...bodyData, _body: true },
        );
      });

      it("should emit 'add:drawable' event when adding drawable component", () => {
        const drawableData = { texture: "sprite.png", width: 32, height: 32 };

        const result = entityEngine.addComponent(entityId, "DrawableSprite", drawableData);

        // Should emit component:added event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "component:added",
          entityId,
          "DrawableSprite",
          drawableData,
        );

        // Should emit add:drawable event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "add:drawable",
          entityId,
          result.componentId,
          { ...drawableData, _drawable: true },
        );
      });

      it("should not emit physics/drawable events for regular components", () => {
        const regularData = { value: 42 };

        entityEngine.addComponent(entityId, "RegularComponent", regularData);

        // Should only emit component:added event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledTimes(1);
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "component:added",
          entityId,
          "RegularComponent",
          regularData,
        );
      });
    });

    describe("removeComponent events", () => {
      it("should emit 'physics:remove:body' event when removing physics component", () => {
        const bodyData = { x: 10, y: 20, mass: 5 };
        const result = entityEngine.addComponent(entityId, "PhysicsBody", bodyData);

        // Clear previous events
        vi.clearAllMocks();

        entityEngine.removeComponent(entityId, "PhysicsBody");

        // Should emit component:removed event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "component:removed",
          entityId,
          "PhysicsBody",
          { ...bodyData, _body: true },
        );

        // Should emit physics:remove:body event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "physics:remove:body",
          entityId,
          result.componentId,
          { ...bodyData, _body: true },
        );
      });

      it("should emit 'remove:drawable' event when removing drawable component", () => {
        const drawableData = { texture: "sprite.png", width: 32, height: 32 };
        const result = entityEngine.addComponent(entityId, "DrawableSprite", drawableData);

        // Clear previous events
        vi.clearAllMocks();

        entityEngine.removeComponent(entityId, "DrawableSprite");

        // Should emit component:removed event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "component:removed",
          entityId,
          "DrawableSprite",
          { ...drawableData, _drawable: true },
        );

        // Should emit remove:drawable event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "remove:drawable",
          entityId,
          result.componentId,
          { ...drawableData, _drawable: true },
        );
      });

      it("should not emit physics/drawable events for regular components", () => {
        const regularData = { value: 42 };
        entityEngine.addComponent(entityId, "RegularComponent", regularData);

        // Clear previous events
        vi.clearAllMocks();

        entityEngine.removeComponent(entityId, "RegularComponent");

        // Should only emit component:removed event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledTimes(1);
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "component:removed",
          entityId,
          "RegularComponent",
          regularData,
        );
      });
    });

    describe("addComponentSetup (setup phase) events", () => {
      it("should NOT emit physics/drawable events during setup phase", () => {
        const bodyData = { x: 10, y: 20, mass: 5 };
        const drawableData = { texture: "sprite.png", width: 32, height: 32 };

        // Use addComponentSetup directly (simulates setup phase)
        entityEngine.addComponentSetup(entityId, "PhysicsBody", bodyData);
        entityEngine.addComponentSetup(entityId, "DrawableSprite", drawableData);

        // Should not emit any physics or drawable events during setup
        expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
          expect.stringMatching(/^physics:/),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
        expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
          expect.stringMatching(/^(add|remove):drawable$/),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });
    });

    describe("clear phase events", () => {
      it("should NOT emit physics/drawable events during clear phase", () => {
        const bodyData = { x: 10, y: 20, mass: 5 };
        const drawableData = { texture: "sprite.png", width: 32, height: 32 };

        // Add components normally (which would emit events)
        entityEngine.addComponent(entityId, "PhysicsBody", bodyData);
        entityEngine.addComponent(entityId, "DrawableSprite", drawableData);

        // Clear previous events
        vi.clearAllMocks();

        // Use removeOnClear directly (simulates clear phase)
        entityEngine.removeOnClear(entityId);

        // Should not emit any physics or drawable events during clear
        expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
          expect.stringMatching(/^physics:/),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
        expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
          expect.stringMatching(/^(add|remove):drawable$/),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });

      it("should NOT emit physics/drawable events during entity remove", () => {
        const bodyData = { x: 10, y: 20, mass: 5 };
        const drawableData = { texture: "sprite.png", width: 32, height: 32 };

        // Add components normally
        entityEngine.addComponent(entityId, "PhysicsBody", bodyData);
        entityEngine.addComponent(entityId, "DrawableSprite", drawableData);

        // Clear previous events
        vi.clearAllMocks();

        // Remove entire entity
        entityEngine.remove(entityId);

        // Should emit entity events but NOT physics/drawable events
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "entity:removing",
          entityId,
          expect.arrayContaining(["PhysicsBody", "DrawableSprite"]),
        );
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("entity:removed", entityId);

        // Should NOT emit physics or drawable events
        expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
          expect.stringMatching(/^physics:/),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
        expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
          expect.stringMatching(/^(add|remove):drawable$/),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });
    });

    describe("removeComponentById events", () => {
      it("should emit physics/drawable events when removing individual components by ID", () => {
        const bodyData = { x: 10, y: 20, mass: 5 };
        const result = entityEngine.addComponent(entityId, "PhysicsBody", bodyData);

        // Clear previous events
        vi.clearAllMocks();

        // Remove component by ID
        const removed = entityEngine.removeComponentById(result.componentId);

        expect(removed).toBe(true);

        // Should emit physics:remove:body event
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "physics:remove:body",
          entityId,
          result.componentId,
          { ...bodyData, _body: true },
        );
      });
    });
  });
});
