/** biome-ignore-all lint/complexity/useLiteralKeys: false positive */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityEngine, EventEngine, RenderEngine, TimeEngine } from "./Engines";
import type { Scene } from "./Engines/Scene/Scene";
import { SceneEngine } from "./Engines/Scene/SceneEngine";
import type { System } from "./Systems/System";
import { TypeEngine } from "./TypeEngine";

// Mock electronAPI for SceneEngine
const mockElectronAPI = {
  openGameWindow: vi.fn(),
  pathParse: vi.fn().mockResolvedValue({
    name: "test.scene",
    dir: "/scenes",
    ext: ".json",
    base: "test.scene.json",
    root: "/",
  }),
  pathJoin: vi.fn().mockResolvedValue("/scenes/test.scene.json"),
  readJsonFile: vi.fn(),
};

// Mock document and DOM elements for RenderEngine
const mockCanvas = { tagName: "CANVAS" };
const mockGameDiv = {
  appendChild: vi.fn(),
  children: [mockCanvas],
  length: 1,
};

global.document = {
  getElementById: vi.fn((id: string) => {
    if (id === "game") return mockGameDiv;
    return null;
  }),
} as unknown as Document;

// Mock window.electronAPI for SceneEngine
Object.defineProperty(global, "window", {
  value: {
    electronAPI: mockElectronAPI,
  },
  writable: true,
});

// Mock requestAnimationFrame and cancelAnimationFrame for TimeEngine
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 16); // Mock 60fps timing
});

global.cancelAnimationFrame = vi.fn((handle: number) => {
  clearTimeout(handle);
});

// Mock performance.now() for TimeEngine
global.performance = {
  now: vi.fn(() => Date.now()),
} as unknown as Performance;

// Mock PIXI Application
vi.mock("pixi.js", () => ({
  Application: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    canvas: mockCanvas,
    stage: {
      addChild: vi.fn(),
      removeChild: vi.fn(),
    },
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    destroy: vi.fn(),
  })),
  Sprite: vi.fn().mockImplementation(() => ({
    anchor: { set: vi.fn() },
    texture: null,
  })),
  Texture: {
    from: vi.fn().mockReturnValue({}),
  },
}));

describe("TypeEngine", () => {
  let engine: TypeEngine;
  let mockRenderEngine: RenderEngine;
  let mockEntityEngine: EntityEngine;
  let mockEventEngine: EventEngine;
  let mockSceneEngine: SceneEngine;
  let mockTimeEngine: TimeEngine;

  beforeEach(() => {
    // Create fresh instances for each test
    mockEventEngine = new EventEngine();
    mockRenderEngine = new RenderEngine({ width: 800, height: 600, eventEngine: mockEventEngine });
    mockEntityEngine = new EntityEngine(mockEventEngine);
    mockSceneEngine = new SceneEngine({
      initialScene: "test",
      scenes: {
        test: "/scenes/test.scene.json",
      },
    });
    mockTimeEngine = new TimeEngine({ fixedFps: 60 });

    engine = new TypeEngine({
      renderEngine: mockRenderEngine,
      entityEngine: mockEntityEngine,
      eventEngine: mockEventEngine,
      sceneEngine: mockSceneEngine,
      timeEngine: mockTimeEngine,
      systemsList: [],
    });
  });

  describe("constructor injection", () => {
    it("should create instance with injected dependencies", () => {
      expect(engine).toBeInstanceOf(TypeEngine);
      expect(engine["Entity"]).toBe(mockEntityEngine);
      expect(engine["eventEngine"]).toBe(mockEventEngine);
      expect(engine["sceneEngine"]).toBe(mockSceneEngine);
      expect(engine["timeEngine"]).toBe(mockTimeEngine);
    });

    it("should create different instances with different dependencies", () => {
      const anotherEventEngine = new EventEngine();
      const anotherRenderEngine = new RenderEngine({
        width: 800,
        height: 600,
        eventEngine: anotherEventEngine,
      });
      const anotherEntityEngine = new EntityEngine(anotherEventEngine);
      const anotherSceneEngine = new SceneEngine({
        initialScene: "another",
        scenes: {
          another: "/scenes/another.scene.json",
        },
      });
      const anotherTimeEngine = new TimeEngine({ fixedFps: 30 });

      const engine2 = new TypeEngine({
        renderEngine: anotherRenderEngine,
        entityEngine: anotherEntityEngine,
        eventEngine: anotherEventEngine,
        sceneEngine: anotherSceneEngine,
        timeEngine: anotherTimeEngine,
        systemsList: [],
      });

      expect(engine).not.toBe(engine2);
      expect(engine2["Entity"]).toBe(anotherEntityEngine);
      expect(engine2["sceneEngine"]).toBe(anotherSceneEngine);
      expect(engine2["timeEngine"]).toBe(anotherTimeEngine);
    });
  });

  describe("ECS initialization", () => {
    it("should initialize with EntityEngine for entity management", () => {
      expect(engine["Entity"]).toBeDefined();
      expect(engine.getRegisteredComponents()).toEqual([]);
    });

    it("should initialize with empty systems array when no systems provided", () => {
      expect(Array.isArray(engine["systems"])).toBe(true);
      expect(engine["systems"].length).toBe(0);
    });

    it("should initialize with provided systems list", () => {
      const mockSystem: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };

      const engineWithSystems = new TypeEngine({
        renderEngine: mockRenderEngine,
        entityEngine: mockEntityEngine,
        eventEngine: mockEventEngine,
        sceneEngine: mockSceneEngine,
        timeEngine: mockTimeEngine,
        systemsList: [mockSystem],
      });

      expect(Array.isArray(engineWithSystems["systems"])).toBe(true);
      expect(engineWithSystems["systems"].length).toBe(1);
      expect(engineWithSystems["systems"][0]).toBe(mockSystem);
    });

    it("should initialize with isRunning as false", () => {
      expect(engine["isRunning"]).toBe(false);
    });

    it("should initialize with empty registered components", () => {
      expect(engine.getRegisteredComponents()).toEqual([]);
    });
  });

  describe("engine access methods", () => {
    it("should provide access to EventEngine via getEventEngine()", () => {
      const eventEngine = engine.getEventEngine();
      expect(eventEngine).toBe(mockEventEngine);
    });

    it("should provide access to RenderEngine via getRenderEngine()", () => {
      const renderEngine = engine.getRenderEngine();
      expect(renderEngine).toBe(mockRenderEngine);
    });

    it("should provide scene management via getCurrentScene()", () => {
      const mockScene = {
        name: "test-scene",
        path: "/scenes",
        filePath: "/scenes/test.scene.json",
        load: vi.fn(),
      } as unknown as Scene;

      vi.spyOn(mockSceneEngine, "getCurrentScene").mockReturnValue(mockScene);

      const currentScene = engine.getCurrentScene();
      expect(currentScene).toBe(mockScene);
      expect(mockSceneEngine.getCurrentScene).toHaveBeenCalled();
    });

    it("should provide scene transition via transition()", async () => {
      const transitionSpy = vi.spyOn(mockSceneEngine, "transition").mockResolvedValue();

      await engine.transition("testScene");

      expect(transitionSpy).toHaveBeenCalledWith("testScene", engine);
    });
  });

  describe("entity management", () => {
    it("should create entity with generated ID when no ID provided", () => {
      const entityId = engine.createEntity();

      expect(typeof entityId).toBe("string");
      expect(entityId).toMatch(/^ENT_/);
      // Entity exists - can add components to it without error
      engine.registerComponent("TestComponent", (data) => data);
      expect(() => engine.addComponent(entityId, "TestComponent", { test: true })).not.toThrow();
    });

    it("should create entity with provided ID", () => {
      const customId = "custom-entity-id";

      const entityId = engine.createEntity(customId);

      expect(entityId).toBe(customId);
      // Entity exists - can add components to it without error
      engine.registerComponent("TestComponent", (data) => data);
      expect(() => engine.addComponent(entityId, "TestComponent", { test: true })).not.toThrow();
    });

    it("should create multiple entities with unique IDs", () => {
      const entity1 = engine.createEntity();
      const entity2 = engine.createEntity();
      const entity3 = engine.createEntity("custom-id");

      expect(entity1).not.toBe(entity2);
      expect(entity1).not.toBe(entity3);
      expect(entity2).not.toBe(entity3);
      // All entities should be unique and valid
      expect(typeof entity1).toBe("string");
      expect(typeof entity2).toBe("string");
      expect(typeof entity3).toBe("string");
    });

    it("should remove entity and all its components", () => {
      const mockComponent = vi.fn((data) => data);

      engine.registerComponent("Position", mockComponent);
      const entityId = engine.createEntity();
      engine.addComponent(entityId, "Position", { x: 10, y: 20 });

      // Component should exist before removal
      expect(engine.getComponent(entityId, "Position")).toEqual({ x: 10, y: 20 });

      engine.removeEntity(entityId);

      // Component should be removed after entity removal
      expect(engine.getComponent(entityId, "Position")).toBeUndefined();
    });

    it("should not crash when removing non-existent entity", () => {
      expect(() => engine.removeEntity("non-existent")).not.toThrow();
    });
  });

  describe("component registration", () => {
    it("should register component and return this for chaining", () => {
      const mockComponent = vi.fn();

      const result = engine.registerComponent("TestComponent", mockComponent);

      expect(result).toBe(engine);
      expect(engine.getRegisteredComponents()).toContain("TestComponent");
    });

    it("should create component map when registering component", () => {
      const mockComponent = vi.fn();

      engine.registerComponent("TestComponent", mockComponent);
      const entityId = engine.createEntity();

      // Should be able to add the registered component to an entity
      expect(() => engine.addComponent(entityId, "TestComponent", { test: true })).not.toThrow();
    });

    it("should allow chaining multiple component registrations", () => {
      const component1 = vi.fn();
      const component2 = vi.fn();
      const component3 = vi.fn();

      const result = engine
        .registerComponent("Component1", component1)
        .registerComponent("Component2", component2)
        .registerComponent("Component3", component3);

      expect(result).toBe(engine);
      const registered = engine.getRegisteredComponents();
      expect(registered).toContain("Component1");
      expect(registered).toContain("Component2");
      expect(registered).toContain("Component3");
      expect(registered).toHaveLength(3);
    });

    it("should get registered components", () => {
      const component1 = vi.fn();
      const component2 = vi.fn();

      engine.registerComponent("Position", component1).registerComponent("Velocity", component2);

      const registeredComponents = engine.getRegisteredComponents();

      expect(registeredComponents).toEqual(["Position", "Velocity"]);
    });

    it("should return empty array when no components registered", () => {
      const registeredComponents = engine.getRegisteredComponents();

      expect(registeredComponents).toEqual([]);
    });
  });

  describe("component management", () => {
    beforeEach(() => {
      const mockComponent = vi.fn((data) => data);
      engine.registerComponent("Position", mockComponent);
      engine.registerComponent("Velocity", mockComponent);
    });

    it("should add component to entity", () => {
      const entityId = engine.createEntity();
      const position = { x: 10, y: 20 };

      engine.addComponent(entityId, "Position", position);

      expect(engine.getComponent(entityId, "Position")).toEqual(position);
      expect(engine.hasComponent(entityId, "Position")).toBe(true);
    });

    it("should throw error when adding component to non-existent entity", () => {
      expect(() => {
        engine.addComponent("non-existent", "Position", { x: 10, y: 20 });
      }).toThrow("Entity with ID non-existent does not exist");
    });

    it("should throw error when adding unregistered component", () => {
      const entityId = engine.createEntity();

      expect(() => {
        engine.addComponent(entityId, "Unregistered", {});
      }).toThrow("Component Unregistered is not registered");
    });

    it("should remove component from entity", () => {
      const entityId = engine.createEntity();

      engine.addComponent(entityId, "Position", { x: 10, y: 20 });
      engine.removeComponent(entityId, "Position");

      expect(engine.getComponent(entityId, "Position")).toBeUndefined();
      expect(engine.hasComponent(entityId, "Position")).toBe(false);
    });

    it("should return undefined for non-existent component", () => {
      const entityId = engine.createEntity();

      expect(engine.getComponent(entityId, "Position")).toBeUndefined();
      expect(engine.hasComponent(entityId, "Position")).toBe(false);
    });
  });

  describe("system management", () => {
    it("should add system and sort by priority", async () => {
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

      // Systems are initialized during setupSystems()
      await engine.setupSystems();
      expect(system1.init).toHaveBeenCalledWith(engine);
      expect(system2.init).toHaveBeenCalledWith(engine);
    });

    it("should remove system and call destroy", () => {
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
      const mockComponent = vi.fn();
      engine.registerComponent("Position", mockComponent);
      engine.registerComponent("Velocity", mockComponent);
      engine.registerComponent("Health", mockComponent);
    });

    it("should query entities with all specified components", () => {
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
      const entity1 = engine.createEntity();
      const entity2 = engine.createEntity();

      engine.addComponent(entity1, "Position", { x: 10, y: 20 });
      engine.addComponent(entity2, "Velocity", { dx: 1, dy: 2 });

      const result = engine.queryEntitiesWithAny(["Position", "Health"]);

      expect(result).toHaveLength(1);
      expect(result[0].entityId).toBe(entity1);
    });
  });

  describe("time engine integration", () => {
    it("should provide access to TimeEngine via delegation methods", () => {
      const mockFunc = vi.fn();
      const mockFixedFunc = vi.fn();

      engine.addTimeFunction(mockFunc);
      engine.addFixedTimeFunction(mockFixedFunc);

      expect(engine.getTimeFunctionCount()).toBe(1);
      expect(engine.getFixedTimeFunctionCount()).toBe(1);
      expect(engine.getFixedTimeStep()).toBe(16.666666666666668); // 1000/60
    });

    it("should remove time functions correctly", () => {
      const mockFunc = vi.fn();
      const mockFixedFunc = vi.fn();

      engine.addTimeFunction(mockFunc);
      engine.addFixedTimeFunction(mockFixedFunc);

      expect(engine.getTimeFunctionCount()).toBe(1);
      expect(engine.getFixedTimeFunctionCount()).toBe(1);

      engine.removeTimeFunction(mockFunc);
      engine.removeFixedTimeFunction(mockFixedFunc);

      expect(engine.getTimeFunctionCount()).toBe(0);
      expect(engine.getFixedTimeFunctionCount()).toBe(0);
    });

    it("should clear all time functions", () => {
      const mockFunc = vi.fn();
      const mockFixedFunc = vi.fn();

      engine.addTimeFunction(mockFunc);
      engine.addFixedTimeFunction(mockFixedFunc);

      expect(engine.getTimeFunctionCount()).toBe(1);
      expect(engine.getFixedTimeFunctionCount()).toBe(1);

      engine.clearTimeFunctions();

      expect(engine.getTimeFunctionCount()).toBe(0);
      expect(engine.getFixedTimeFunctionCount()).toBe(0);
    });

    it("should delegate TimeEngine running state", () => {
      expect(engine.getTimeEngineRunning()).toBe(false);

      engine.start();
      expect(engine.getTimeEngineRunning()).toBe(true);

      engine.stop();
      expect(engine.getTimeEngineRunning()).toBe(false);
    });

    it("should automatically add update method to TimeEngine on start", () => {
      expect(engine.getTimeFunctionCount()).toBe(0);

      engine.start();
      expect(engine.getTimeFunctionCount()).toBe(1); // update method added

      // Starting again should not add it twice
      engine.stop();
      engine.start();
      expect(engine.getTimeFunctionCount()).toBe(1);
    });

    it("should reset update flag when clearing time functions", () => {
      engine.start();
      expect(engine.getTimeFunctionCount()).toBe(1);

      engine.clearTimeFunctions();
      expect(engine.getTimeFunctionCount()).toBe(0);

      // Should add update method again on next start
      engine.start();
      expect(engine.getTimeFunctionCount()).toBe(1);
    });
  });

  describe("engine lifecycle", () => {
    it("should start and stop engine and time engine", () => {
      expect(engine["isRunning"]).toBe(false);
      expect(engine.getTimeEngineRunning()).toBe(false);

      engine.start();
      expect(engine["isRunning"]).toBe(true);
      expect(engine.getTimeEngineRunning()).toBe(true);

      engine.stop();
      expect(engine["isRunning"]).toBe(false);
      expect(engine.getTimeEngineRunning()).toBe(false);
    });

    it("should update enabled systems when running", () => {
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

  describe("EventEngine integration", () => {
    it("should provide access to EventEngine", () => {
      const eventEngine = engine.getEventEngine();

      expect(eventEngine).toBeInstanceOf(EventEngine);
      expect(eventEngine).toBe(mockEventEngine);
    });

    it("should emit entity creation events", () => {
      const eventEngine = engine.getEventEngine();
      const listener = vi.fn();

      eventEngine.on("entity:created", listener);
      const entityId = engine.createEntity();
      eventEngine.processEvents();

      expect(listener).toHaveBeenCalledWith(entityId);
    });

    it("should emit entity removal events", () => {
      const eventEngine = engine.getEventEngine();
      const removingListener = vi.fn();
      const removedListener = vi.fn();

      eventEngine.on("entity:removing", removingListener);
      eventEngine.on("entity:removed", removedListener);

      const entityId = engine.createEntity();
      engine.removeEntity(entityId);
      eventEngine.processEvents();

      expect(removingListener).toHaveBeenCalledWith(entityId, []);
      expect(removedListener).toHaveBeenCalledWith(entityId);
    });

    it("should emit component events", () => {
      const eventEngine = engine.getEventEngine();
      const addedListener = vi.fn();
      const removedListener = vi.fn();
      const mockComponent = vi.fn((data) => data);

      engine.registerComponent("Position", mockComponent);
      eventEngine.on("component:added", addedListener);
      eventEngine.on("component:removed", removedListener);

      const entityId = engine.createEntity();
      const componentData = { x: 10, y: 20 };

      engine.addComponent(entityId, "Position", componentData);
      eventEngine.processEvents();
      expect(addedListener).toHaveBeenCalledWith(entityId, "Position", componentData);

      engine.removeComponent(entityId, "Position");
      eventEngine.processEvents();
      expect(removedListener).toHaveBeenCalledWith(entityId, "Position", componentData);
    });

    it("should emit engine update events", () => {
      const eventEngine = engine.getEventEngine();
      const startListener = vi.fn();
      const endListener = vi.fn();

      eventEngine.on("engine:update:start", startListener);
      eventEngine.on("engine:update:end", endListener);

      engine.start();
      engine.update(16.67);

      expect(startListener).toHaveBeenCalledWith(16.67);
      expect(endListener).toHaveBeenCalledWith(16.67);
    });

    it("should emit system update events", () => {
      const eventEngine = engine.getEventEngine();
      const startListener = vi.fn();
      const endListener = vi.fn();
      const system: System<TypeEngine> = {
        priority: 10,
        enabled: true,
        init: vi.fn(),
        update: vi.fn(),
      };

      eventEngine.on("system:update:start", startListener);
      eventEngine.on("system:update:end", endListener);

      engine.addSystem(system);
      engine.start();
      engine.update(16.67);

      expect(startListener).toHaveBeenCalledWith(system, 16.67);
      expect(endListener).toHaveBeenCalledWith(system, 16.67);
    });

    it("should process queued events during update", () => {
      const eventEngine = engine.getEventEngine();
      const listener = vi.fn();

      eventEngine.on("test:event", listener);
      eventEngine.emit("test:event", "queued-data");

      engine.start();
      engine.update(16.67);

      expect(listener).toHaveBeenCalledWith("queued-data");
    });
  });
});
