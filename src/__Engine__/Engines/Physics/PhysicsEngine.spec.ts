import { Bodies, type Body, type Engine, type IEventCollision } from "matter-js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { TypeEngine } from "../../TypeEngine";
import type { EventEngine } from "../Event/EventEngine";
import { PhysicsEngine } from "./PhysicsEngine";

describe("PhysicsEngine", () => {
  let physics_engine: PhysicsEngine;
  let mock_event_engine: EventEngine;
  let mock_type_engine: TypeEngine;

  beforeEach(() => {
    mock_event_engine = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      processEvents: vi.fn(),
    } as unknown as EventEngine;

    mock_type_engine = {
      queryEntities: vi.fn().mockReturnValue([]),
      EntityEngine: {
        getEntity: vi.fn() as Mock,
        queryEntities: vi.fn().mockReturnValue([]),
      },
    } as unknown as TypeEngine;

    physics_engine = new PhysicsEngine({
      eventEngine: mock_event_engine,
      gravity: { x: 0, y: 0.8 },
    });
  });

  describe("constructor", () => {
    it("should initialize with default gravity", () => {
      const engine = new PhysicsEngine({
        eventEngine: mock_event_engine,
      });
      expect(engine.getGravity()).toEqual({ x: 0, y: 1 });
    });

    it("should initialize with custom gravity", () => {
      expect(physics_engine.getGravity()).toEqual({ x: 0, y: 0.8 });
    });
  });

  describe("setup", () => {
    it("should setup collision event listeners", async () => {
      await physics_engine.setup(mock_type_engine);
      expect(mock_event_engine.on).toHaveBeenCalledWith(
        "physics:collision:enter",
        expect.any(Function),
      );
      expect(mock_event_engine.on).toHaveBeenCalledWith(
        "physics:collision:exit",
        expect.any(Function),
      );
      expect(mock_event_engine.on).toHaveBeenCalledWith("physics:add:body", expect.any(Function));
      expect(mock_event_engine.on).toHaveBeenCalledWith(
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
      // Mock entity resolution
      (mock_type_engine.EntityEngine.getEntity as Mock).mockImplementation((id: string) => ({
        entityId: id,
        components: {},
      }));

      await physics_engine.setup(mock_type_engine);

      const collision_data: IEventCollision<Engine> = {
        pairs: [
          {
            bodyA,
            bodyB,
            collision: {},
            // biome-ignore lint/suspicious/noExplicitAny: test mock object
          } as any,
        ],
        // biome-ignore lint/suspicious/noExplicitAny: test mock object
      } as any;

      // Simulate collision event by calling the bound handler
      // biome-ignore lint/suspicious/noExplicitAny: accessing private test property
      const handler = (physics_engine as any).boundHandleCollisionEnter;
      handler(collision_data);

      expect(mock_event_engine.emit).toHaveBeenCalledWith("physics:collision:enter:entity1", {
        entityId: "entity2",
        components: {},
      });
      expect(mock_event_engine.emit).toHaveBeenCalledWith("physics:collision:enter:entity2", {
        entityId: "entity1",
        components: {},
      });
    });

    it("should emit collision exit events with entities", async () => {
      // Mock entity resolution
      (mock_type_engine.EntityEngine.getEntity as Mock).mockImplementation((id: string) => ({
        entityId: id,
        components: {},
      }));

      await physics_engine.setup(mock_type_engine);

      const collision_data: IEventCollision<Engine> = {
        pairs: [
          {
            bodyA,
            bodyB,
            collision: {},
            // biome-ignore lint/suspicious/noExplicitAny: test mock object
          } as any,
        ],
        // biome-ignore lint/suspicious/noExplicitAny: test mock object
      } as any;

      // Simulate collision event by calling the bound handler
      // biome-ignore lint/suspicious/noExplicitAny: accessing private test property
      const handler = (physics_engine as any).boundHandleCollisionExit;
      handler(collision_data);

      expect(mock_event_engine.emit).toHaveBeenCalledWith("physics:collision:exit:entity1", {
        entityId: "entity2",
        components: {},
      });
      expect(mock_event_engine.emit).toHaveBeenCalledWith("physics:collision:exit:entity2", {
        entityId: "entity1",
        components: {},
      });
    });

    it("should handle collision with unknown bodies", async () => {
      // Mock entity resolution - unknown body returns undefined
      (mock_type_engine.EntityEngine.getEntity as Mock).mockImplementation((id: string) =>
        id === "entity2" ? { entityId: id, components: {} } : undefined,
      );

      await physics_engine.setup(mock_type_engine);

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

      // Simulate collision event by calling the bound handler
      // biome-ignore lint/suspicious/noExplicitAny: accessing private test property
      const handler = (physics_engine as any).boundHandleCollisionEnter;
      handler(collision_data);

      // Should not emit any events since one entity is unknown
      expect(mock_event_engine.emit).not.toHaveBeenCalled();
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
      await physics_engine.setup(mock_type_engine);

      // Add some test data
      const body = Bodies.rectangle(0, 0, 10, 10);
      physics_engine.addBody("test", "collider", body);

      physics_engine.destroy();

      expect(mock_event_engine.off).toHaveBeenCalled();
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
      const mockEntities = [
        {
          entityId: "entity1",
          components: {
            collider: { _body: mockBody },
          },
        },
      ];

      mock_type_engine.EntityEngine.queryEntities = vi.fn().mockReturnValue(mockEntities);

      physics_engine.setupScene(mock_type_engine);

      expect(physics_engine.getBodyMap().get("entity1")?.get("collider")).toBe(mockBody);
      expect(physics_engine.getBodyToEntityMap().get(mockBody)).toBe("entity1");
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
