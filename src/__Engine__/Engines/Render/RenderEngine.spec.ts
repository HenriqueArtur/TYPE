import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpriteComponent } from "../../Component/Drawable/SpriteComponent";
import type { TypeEngine } from "../../TypeEngine";
import { EventEngine } from "../Event/EventEngine";
import { RenderEngine, type RenderEngineOptions } from "./RenderEngine";

// Helper for accessing private static properties in tests
const getRenderEngineStatic = () =>
  RenderEngine as unknown as {
    app: unknown;
    container: unknown;
  };

// Helper for accessing private instance properties in tests
const getRenderEnginePrivate = (engine: RenderEngine) =>
  engine as unknown as {
    spriteMap: Map<string, SpriteComponent>;
  };

// Mock document and DOM elements
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

// Mock PIXI Application
vi.mock("pixi.js", () => ({
  Application: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    canvas: { tagName: "CANVAS" },
    destroy: vi.fn(),
  })),
  Assets: {
    load: vi.fn().mockResolvedValue({}),
  },
  Sprite: vi.fn().mockImplementation(() => ({
    texture: null,
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    alpha: 1,
    visible: true,
    anchor: { x: 0.5, y: 0.5, set: vi.fn() },
  })),
  Texture: {
    EMPTY: {},
  },
}));

describe("RenderEngine", () => {
  let renderEngine: RenderEngine;
  let mockEngine: TypeEngine;
  let eventEngine: EventEngine;
  let renderData: RenderEngineOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    eventEngine = new EventEngine();
    renderData = {
      width: 800,
      height: 600,
      html_tag_id: "game",
      eventEngine: eventEngine,
    };
    renderEngine = new RenderEngine(renderData);
    mockEngine = {
      queryEntities: vi.fn().mockReturnValue([]),
    } as unknown as TypeEngine;
  });

  describe("constructor", () => {
    it("should create RenderEngine with default dimensions", () => {
      const engine = new RenderEngine({ width: 800, height: 600, eventEngine: new EventEngine() });
      expect(engine._instance).toBeDefined();
    });

    it("should create RenderEngine with custom dimensions", () => {
      const customData = {
        width: 1024,
        height: 768,
        html_tag_id: "custom",
        eventEngine: new EventEngine(),
      };
      const engine = new RenderEngine(customData);
      expect(engine._instance).toBeDefined();
    });

    it("should set up event listeners for remove:drawable", () => {
      const testEventEngine = new EventEngine();
      new RenderEngine({ width: 800, height: 600, eventEngine: testEventEngine });

      expect(testEventEngine.hasListeners("remove:drawable")).toBe(true);
      expect(testEventEngine.getListenerCount("remove:drawable")).toBe(1);
    });

    it("should append canvas to DOM element", () => {
      const gameDiv = document.getElementById("game");
      expect(gameDiv?.children.length).toBeGreaterThan(0);
    });
  });

  describe("loadAllSprites", () => {
    it("should handle empty sprite entities", async () => {
      mockEngine.queryEntities = vi.fn().mockReturnValue([]);

      await expect(renderEngine.loadAllSprites(mockEngine)).resolves.not.toThrow();
    });

    it("should load sprites from engine entities", async () => {
      const mockSpriteComponent = new SpriteComponent({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      mockEngine.queryEntities = vi.fn().mockReturnValue([
        {
          entityId: "entity-1",
          components: {
            SpriteComponent: mockSpriteComponent,
          },
        },
      ]);

      // Mock static container
      const mockContainer = {
        addChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      await renderEngine.loadAllSprites(mockEngine);

      expect(mockEngine.queryEntities).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(mockContainer.addChild).toHaveBeenCalledWith(mockSpriteComponent._sprite);
    });

    it("should not load sprites when container is null", async () => {
      getRenderEngineStatic().container = null;
      mockEngine.queryEntities = vi.fn().mockReturnValue([
        {
          entityId: "entity-1",
          components: {
            SpriteComponent: new SpriteComponent({ texture_path: "test.png" }),
          },
        },
      ]);

      await expect(renderEngine.loadAllSprites(mockEngine)).resolves.not.toThrow();
      // queryEntities should not be called when container is null (early return)
      expect(mockEngine.queryEntities).not.toHaveBeenCalled();
    });

    it("should load multiple sprite entities", async () => {
      const sprite1 = new SpriteComponent({ texture_path: "sprite1.png" });
      const sprite2 = new SpriteComponent({ texture_path: "sprite2.png" });

      mockEngine.queryEntities = vi.fn().mockReturnValue([
        { entityId: "entity-1", components: { SpriteComponent: sprite1 } },
        { entityId: "entity-2", components: { SpriteComponent: sprite2 } },
      ]);

      const mockContainer = {
        addChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      await renderEngine.loadAllSprites(mockEngine);

      expect(mockContainer.addChild).toHaveBeenCalledTimes(2);
      expect(mockContainer.addChild).toHaveBeenCalledWith(sprite1._sprite);
      expect(mockContainer.addChild).toHaveBeenCalledWith(sprite2._sprite);
    });
  });

  describe("destroy", () => {
    it("should destroy app instance when app exists", () => {
      const mockApp = {
        destroy: vi.fn(),
      };
      getRenderEngineStatic().app = mockApp;

      renderEngine.destroy(mockEngine);

      expect(mockApp.destroy).toHaveBeenCalled();
      expect(getRenderEngineStatic().app).toBeNull();
      expect(getRenderEngineStatic().container).toBeNull();
    });

    it("should clean up event listeners on destroy", () => {
      const testEventEngine = new EventEngine();
      const engine = new RenderEngine({ width: 800, height: 600, eventEngine: testEventEngine });

      expect(testEventEngine.hasListeners("remove:drawable")).toBe(true);

      engine.destroy(mockEngine);

      expect(testEventEngine.hasListeners("remove:drawable")).toBe(false);
    });

    it("should clear spriteMap on destroy", () => {
      const spriteComponent = new SpriteComponent({ texture_path: "test.png" });
      getRenderEnginePrivate(renderEngine).spriteMap.set("test-entity", spriteComponent);

      expect(getRenderEnginePrivate(renderEngine).spriteMap.size).toBe(1);

      renderEngine.destroy(mockEngine);

      expect(getRenderEnginePrivate(renderEngine).spriteMap.size).toBe(0);
    });

    it("should handle destroy when app is null", () => {
      getRenderEngineStatic().app = null;
      getRenderEngineStatic().container = {};

      expect(() => renderEngine.destroy(mockEngine)).not.toThrow();
      expect(getRenderEngineStatic().container).toBeNull();
    });

    it("should reset static properties", () => {
      getRenderEngineStatic().app = {
        destroy: vi.fn(),
      };
      getRenderEngineStatic().container = {};

      renderEngine.destroy(mockEngine);

      expect(getRenderEngineStatic().app).toBeNull();
      expect(getRenderEngineStatic().container).toBeNull();
    });
  });

  describe("static properties", () => {
    it("should have static app property", () => {
      expect(RenderEngine).toHaveProperty("app");
    });

    it("should have static container property", () => {
      expect(RenderEngine).toHaveProperty("container");
    });
  });

  describe("remove:drawable event handling", () => {
    it("should remove sprite from container when remove:drawable event is received", () => {
      const mockContainer = {
        addChild: vi.fn(),
        removeChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      const spriteComponent = new SpriteComponent({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      // Add sprite to the spriteMap (simulate loadAllSprites)
      const entityId = "test-entity";
      getRenderEnginePrivate(renderEngine).spriteMap.set(entityId, spriteComponent);

      // Emit remove:drawable event
      eventEngine.emit("remove:drawable", {
        entityId,
        componentName: "SpriteComponent",
        componentData: { texture: "test.png" },
      });
      eventEngine.processEvents();

      expect(mockContainer.removeChild).toHaveBeenCalledWith(spriteComponent._sprite);
      expect(getRenderEnginePrivate(renderEngine).spriteMap.has(entityId)).toBe(false);
    });

    it("should handle remove:drawable event when sprite not found", () => {
      const mockContainer = {
        removeChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      eventEngine.emit("remove:drawable", {
        entityId: "non-existent-entity",
        componentName: "SpriteComponent",
        componentData: { texture: "test.png" },
      });
      eventEngine.processEvents();

      expect(mockContainer.removeChild).not.toHaveBeenCalled();
    });

    it("should handle remove:drawable event when container is null", () => {
      getRenderEngineStatic().container = null;

      const spriteComponent = new SpriteComponent({
        texture_path: "test.png",
      });

      const entityId = "test-entity";
      getRenderEnginePrivate(renderEngine).spriteMap.set(entityId, spriteComponent);

      expect(() => {
        eventEngine.emit("remove:drawable", {
          entityId,
          componentName: "SpriteComponent",
          componentData: { texture: "test.png" },
        });
        eventEngine.processEvents();
      }).not.toThrow();

      // Sprite should be removed from map even if container is null
      expect(getRenderEnginePrivate(renderEngine).spriteMap.has(entityId)).toBe(false);
    });

    it("should track sprites in spriteMap during loadAllSprites", async () => {
      const sprite1 = new SpriteComponent({ texture_path: "sprite1.png" });
      const sprite2 = new SpriteComponent({ texture_path: "sprite2.png" });

      mockEngine.queryEntities = vi.fn().mockReturnValue([
        { entityId: "entity-1", components: { SpriteComponent: sprite1 } },
        { entityId: "entity-2", components: { SpriteComponent: sprite2 } },
      ]);

      const mockContainer = {
        addChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      await renderEngine.loadAllSprites(mockEngine);

      expect(getRenderEnginePrivate(renderEngine).spriteMap.size).toBe(2);
      expect(getRenderEnginePrivate(renderEngine).spriteMap.get("entity-1")).toBe(sprite1);
      expect(getRenderEnginePrivate(renderEngine).spriteMap.get("entity-2")).toBe(sprite2);
    });
  });

  describe("integration", () => {
    it("should work with TypeEngine sprite query", async () => {
      const spriteComponent = new SpriteComponent({
        texture_path: "integration.png",
        position: { x: 100, y: 200 },
        scale: { x: 2, y: 2 },
        rotation: 1.5,
        alpha: 0.8,
        visible: true,
      });

      mockEngine.queryEntities = vi.fn().mockReturnValue([
        {
          entityId: "integration-entity",
          components: {
            SpriteComponent: spriteComponent,
          },
        },
      ]);

      const mockContainer = {
        addChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      await renderEngine.loadAllSprites(mockEngine);

      expect(mockEngine.queryEntities).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(mockContainer.addChild).toHaveBeenCalledWith(spriteComponent._sprite);
    });
  });
});
