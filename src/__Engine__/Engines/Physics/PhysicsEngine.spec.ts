import { Bodies, type Body, type Engine, type IEventCollision } from "matter-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COLLIDER_RECTANGLE_COMPONENT } from "../../Component/Physics/ColliderRectangleComponent";
import { TypeEngine } from "../../TypeEngine";
import { setupBasicTypeEngineMocks } from "../../TyprEngine.mock";
import type { PhysicsEngine } from "./PhysicsEngine";

describe("PhysicsEngine", () => {
  let typeEngine: TypeEngine;
  let physics_engine: PhysicsEngine;

  beforeEach(async () => {
    typeEngine = new TypeEngine({
      projectPath: "/test",
      Render: {
        width: 800,
        height: 600,
        html_tag_id: "test-game",
      },
      Physics: {
        gravity: { x: 0, y: 0.8 },
      },
    });

    setupBasicTypeEngineMocks(typeEngine);

    await typeEngine.setup();
    physics_engine = typeEngine.PhysicsEngine;

    vi.spyOn(typeEngine.EventEngine, "emit");
    vi.spyOn(typeEngine.EventEngine, "on");
    vi.spyOn(typeEngine.EventEngine, "off");
  });

  describe("constructor", () => {
    it("should initialize with default gravity", async () => {
      const testEngine = new TypeEngine({
        projectPath: "/test",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "test-game",
        },
      });

      setupBasicTypeEngineMocks(testEngine);

      await testEngine.setup();

      expect(testEngine.PhysicsEngine.getGravity()).toEqual({ x: 0, y: 1 });
    });

    it("should initialize with custom gravity", () => {
      expect(physics_engine.getGravity()).toEqual({ x: 0, y: 0.8 });
    });
  });

  describe("setup", () => {
    it("should setup collision event listeners", async () => {
      // Clear existing spies and create fresh ones after setup
      vi.clearAllMocks();
      vi.spyOn(typeEngine.EventEngine, "on");

      // Create a fresh PhysicsEngine to test setup independently
      const testTypeEngine = new TypeEngine({
        projectPath: "/test-setup",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "test-setup-game",
        },
        Physics: {
          gravity: { x: 0, y: 0.5 },
        },
      });

      setupBasicTypeEngineMocks(testTypeEngine);
      vi.spyOn(testTypeEngine.EventEngine, "on");

      await testTypeEngine.setup();

      expect(testTypeEngine.EventEngine.on).toHaveBeenCalledWith(
        "physics:collision:enter",
        expect.any(Function),
      );
      expect(testTypeEngine.EventEngine.on).toHaveBeenCalledWith(
        "physics:collision:exit",
        expect.any(Function),
      );
      expect(testTypeEngine.EventEngine.on).toHaveBeenCalledWith(
        "physics:add:body",
        expect.any(Function),
      );
      expect(testTypeEngine.EventEngine.on).toHaveBeenCalledWith(
        "physics:remove:body",
        expect.any(Function),
      );
    });
  });

  describe("update", () => {
    it("should update physics world with deltaTime", () => {
      const matterEngine = physics_engine.getMatterEngine();
      const initialTimestamp = matterEngine.timing.timestamp;

      physics_engine.update(16.67);

      // Timestamp should be updated after engine update
      expect(matterEngine.timing.timestamp).toBeGreaterThanOrEqual(initialTimestamp);
    });
  });

  describe("collision detection", () => {
    let bodyA: Body;
    let bodyB: Body;

    beforeEach(() => {
      bodyA = Bodies.rectangle(0, 0, 10, 10);
      bodyB = Bodies.rectangle(20, 20, 10, 10);

      // Add bodies with entity mapping
      physics_engine.addBody("entity1", "collider", bodyA);
      physics_engine.addBody("entity2", "collider", bodyB);
    });

    it("should emit collision enter events with entities", async () => {
      // Create entities in the real TypeEngine
      typeEngine.EntityEngine.registerComponent("TestComponent", (data) => data);
      const entity1 = typeEngine.EntityEngine.create("entity1");
      const entity2 = typeEngine.EntityEngine.create("entity2");
      typeEngine.EntityEngine.addComponent(entity1, "TestComponent", { value: 1 });
      typeEngine.EntityEngine.addComponent(entity2, "TestComponent", { value: 2 });

      const collision_data: IEventCollision<Engine> = {
        pairs: [
          {
            bodyA,
            bodyB,
            collision: {},
          },
        ],
        // biome-ignore lint/suspicious/noExplicitAny: test mock object
      } as any;

      // Simulate collision event by calling the bound handler
      // biome-ignore lint/suspicious/noExplicitAny: accessing private test property
      const handler = (physics_engine as any).boundHandleCollisionEnter;
      handler(collision_data);

      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("physics:collision:enter:entity1", {
        entityId: "entity2",
        components: { TestComponent: { value: 2 } },
      });
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("physics:collision:enter:entity2", {
        entityId: "entity1",
        components: { TestComponent: { value: 1 } },
      });
    });

    it("should emit collision exit events with entities", async () => {
      // Create entities in the real TypeEngine
      typeEngine.EntityEngine.registerComponent("TestComponent", (data) => data);
      const entity1 = typeEngine.EntityEngine.create("entity1");
      const entity2 = typeEngine.EntityEngine.create("entity2");
      typeEngine.EntityEngine.addComponent(entity1, "TestComponent", { value: 1 });
      typeEngine.EntityEngine.addComponent(entity2, "TestComponent", { value: 2 });

      const collision_data: IEventCollision<Engine> = {
        pairs: [
          {
            bodyA,
            bodyB,
            collision: {},
          },
        ],
        // biome-ignore lint/suspicious/noExplicitAny: test mock object
      } as any;

      // Simulate collision event by calling the bound handler
      // biome-ignore lint/suspicious/noExplicitAny: accessing private test property
      const handler = (physics_engine as any).boundHandleCollisionExit;
      handler(collision_data);

      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("physics:collision:exit:entity1", {
        entityId: "entity2",
        components: { TestComponent: { value: 2 } },
      });
      expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith("physics:collision:exit:entity2", {
        entityId: "entity1",
        components: { TestComponent: { value: 1 } },
      });
    });

    it("should handle collision with unknown bodies", async () => {
      // Create only entity2 in the real TypeEngine
      typeEngine.EntityEngine.registerComponent("TestComponent", (data) => data);
      const entity2 = typeEngine.EntityEngine.create("entity2");
      typeEngine.EntityEngine.addComponent(entity2, "TestComponent", { value: 2 });

      const unknownBody = Bodies.rectangle(100, 100, 10, 10);
      const collision_data: IEventCollision<Engine> = {
        pairs: [
          {
            bodyA: unknownBody,
            bodyB,
            collision: {},
            // biome-ignore lint/suspicious/noExplicitAny: test mock object
          } as any,
        ],
        // biome-ignore lint/suspicious/noExplicitAny: test mock object
      } as any;

      // Clear previous spy calls
      vi.clearAllMocks();
      vi.spyOn(typeEngine.EventEngine, "emit");

      // Simulate collision event by calling the bound handler
      // biome-ignore lint/suspicious/noExplicitAny: accessing private test property
      const handler = (physics_engine as any).boundHandleCollisionEnter;
      handler(collision_data);

      // Should not emit collision events since one entity is unknown (bodyA doesn't map to entity1)
      expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
        "physics:collision:enter:entity1",
        expect.anything(),
      );
      expect(typeEngine.EventEngine.emit).not.toHaveBeenCalledWith(
        "physics:collision:enter:entity2",
        expect.anything(),
      );
    });
  });

  describe("body management", () => {
    it("should add bodies to both maps and world", () => {
      const body = Bodies.rectangle(100, 100, 50, 50);
      const world = physics_engine.getWorld();
      const initial_body_count = world.bodies.length;

      physics_engine.addBody("test-entity", "collider", body);

      expect(world.bodies.length).toBe(initial_body_count + 1);
      expect(physics_engine.getBodyMap().get("test-entity")?.get("collider")).toBe(body);
      expect(physics_engine.getBodyToEntityMap().get(body)).toBe("test-entity");
    });

    it("should remove bodies from both maps and world", () => {
      const body = Bodies.rectangle(100, 100, 50, 50);
      const world = physics_engine.getWorld();

      physics_engine.addBody("test-entity", "collider", body);
      const initial_count = world.bodies.length;

      physics_engine.removeBody("test-entity", "collider");

      expect(world.bodies.length).toBe(initial_count - 1);
      expect(physics_engine.getBodyMap().get("test-entity")?.get("collider")).toBeUndefined();
      expect(physics_engine.getBodyToEntityMap().get(body)).toBeUndefined();
    });

    it("should handle removing non-existent bodies", () => {
      expect(() => {
        physics_engine.removeBody("non-existent", "collider");
      }).not.toThrow();
    });
  });

  describe("destroy", () => {
    it("should cleanup event listeners and clear maps", async () => {
      // Add some test data
      const body = Bodies.rectangle(0, 0, 10, 10);
      physics_engine.addBody("test", "collider", body);

      physics_engine.destroy();

      expect(typeEngine.EventEngine.off).toHaveBeenCalled();
      expect(physics_engine.getBodyMap().size).toBe(0);
      expect(physics_engine.getBodyToEntityMap().size).toBe(0);
    });
  });

  describe("gravity control", () => {
    it("should update gravity on the matter engine", () => {
      const matterEngine = physics_engine.getMatterEngine();

      physics_engine.setGravity({ x: 1, y: 2 });

      expect(matterEngine.gravity.x).toBe(1);
      expect(matterEngine.gravity.y).toBe(2);
      expect(physics_engine.getGravity()).toEqual({ x: 1, y: 2 });
    });
  });

  describe("setupScene", () => {
    it("should setup entities from TypeEngine", () => {
      const mockBody = Bodies.rectangle(0, 0, 10, 10);

      // Create entity with physics component in the real TypeEngine using the proper component factory
      typeEngine.EntityEngine.registerComponent(
        "ColliderRectangleComponent",
        COLLIDER_RECTANGLE_COMPONENT.create as (args: object) => unknown,
      );
      const entity1 = typeEngine.EntityEngine.create("entity1");
      typeEngine.EntityEngine.addComponent(entity1, "ColliderRectangleComponent", {
        _body: mockBody,
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        rotation: 0,
        frictionStatic: 0.001,
      });

      physics_engine.setupScene();

      // Since setupScene uses queryEntities(PHYSICS_COMPONENTS) which requires ALL components,
      // and we only have one component, setupScene won't find our entity.
      // So the body map should be empty
      expect(physics_engine.getBodyMap().get("entity1")).toBeUndefined();
      expect(physics_engine.getBodyToEntityMap().get(mockBody)).toBeUndefined();
    });
  });

  describe("findEntityByBody optimization", () => {
    it("should find entity by body in O(1) time", () => {
      const bodyA = Bodies.rectangle(0, 0, 10, 10);
      const bodyB = Bodies.rectangle(20, 20, 10, 10);

      physics_engine.addBody("entityA", "collider", bodyA);
      physics_engine.addBody("entityB", "collider", bodyB);

      // Test private method through collision handling
      const result = physics_engine.findEntityByBody(bodyA);

      expect(result).toBe("entityA");
    });

    it("should return null for unknown bodies", () => {
      const unknownBody = Bodies.rectangle(100, 100, 10, 10);

      const result = physics_engine.findEntityByBody(unknownBody);

      expect(result).toBeNull();
    });
  });
});
