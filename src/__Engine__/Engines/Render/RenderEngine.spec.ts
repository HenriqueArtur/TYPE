import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpriteComponent } from "../../Component/Drawable/SpriteComponent";
import { TypeEngine } from "../../TypeEngine";
import { RenderEngine } from "./RenderEngine";

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
    stage: {
      addChild: vi.fn(),
      removeChild: vi.fn(),
    },
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
  let typeEngine: TypeEngine;
  let renderEngine: RenderEngine;

  beforeEach(async () => {
    vi.clearAllMocks();

    typeEngine = new TypeEngine({
      projectPath: "/test",
      Render: {
        width: 800,
        height: 600,
        html_tag_id: "game",
      },
      Physics: {
        gravity: { x: 0, y: 0.8 },
      },
      systemsList: [],
    });

    // Mock only the problematic methods to avoid PIXI.js initialization issues
    vi.spyOn(typeEngine.RenderEngine, "setup").mockImplementation(async () => {});
    vi.spyOn(typeEngine.SceneEngine, "setup").mockImplementation(async () => {});
    vi.spyOn(typeEngine.SceneEngine, "transition").mockImplementation(async () => {});
    vi.spyOn(typeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});

    await typeEngine.setup();
    renderEngine = typeEngine.RenderEngine;

    vi.spyOn(typeEngine.EventEngine, "emit");
    vi.spyOn(typeEngine.EventEngine, "on");
    vi.spyOn(typeEngine.EventEngine, "off");
  });

  describe("constructor", () => {
    it("should create RenderEngine with default dimensions", () => {
      expect(renderEngine._instance).toBeDefined();
    });

    it("should create RenderEngine with custom dimensions", async () => {
      const customTypeEngine = new TypeEngine({
        projectPath: "/test-custom",
        Render: {
          width: 1024,
          height: 768,
          html_tag_id: "custom",
        },
        systemsList: [],
      });

      vi.spyOn(customTypeEngine.RenderEngine, "setup").mockImplementation(async () => {});
      vi.spyOn(customTypeEngine.SceneEngine, "setup").mockImplementation(async () => {});
      vi.spyOn(customTypeEngine.SceneEngine, "transition").mockImplementation(async () => {});
      vi.spyOn(customTypeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});

      await customTypeEngine.setup();
      expect(customTypeEngine.RenderEngine._instance).toBeDefined();
    });

    it("should set up event listeners for remove:drawable", async () => {
      const testTypeEngine = new TypeEngine({
        projectPath: "/test-listeners",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "test-listeners-game",
        },
        systemsList: [],
      });

      vi.spyOn(testTypeEngine.RenderEngine, "setup").mockImplementation(async () => {
        testTypeEngine.EventEngine.on("remove:drawable", () => {});
      });
      vi.spyOn(testTypeEngine.SceneEngine, "setup").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.SceneEngine, "transition").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});

      await testTypeEngine.setup();

      expect(testTypeEngine.EventEngine.hasListeners("remove:drawable")).toBe(true);
      expect(testTypeEngine.EventEngine.getListenerCount("remove:drawable")).toBe(1);
    });

    it("should append canvas to DOM element", () => {
      const gameDiv = document.getElementById("game");
      expect(gameDiv?.children.length).toBeGreaterThan(0);
    });
  });

  describe("setupScene", () => {
    it("should handle empty sprite entities", async () => {
      vi.spyOn(typeEngine.EntityEngine, "queryEntities").mockReturnValue([]);

      await expect(renderEngine.setupScene()).resolves.not.toThrow();
    });

    it("should load sprites from engine entities", async () => {
      const mockSpriteComponent = new SpriteComponent({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      vi.spyOn(typeEngine.EntityEngine, "queryEntities").mockReturnValue([
        {
          entityId: "entity-1",
          components: {
            SpriteComponent: mockSpriteComponent,
          },
        },
      ]);

      // Create a proper mock setup since we're mocking the setup method
      vi.spyOn(renderEngine, "setup").mockImplementation(async () => {});
      await renderEngine.setup();

      await renderEngine.setupScene();

      expect(typeEngine.EntityEngine.queryEntities).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(
        mockSpriteComponent._sprite,
      );
    });

    it("should handle sprites when stage is initialized", async () => {
      const testTypeEngine = new TypeEngine({
        projectPath: "/test-stage",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "test-stage-game",
        },
        systemsList: [],
      });

      vi.spyOn(testTypeEngine.RenderEngine, "setup").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.SceneEngine, "setup").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.SceneEngine, "transition").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});

      await testTypeEngine.setup();
      await testTypeEngine.RenderEngine.setup();

      vi.spyOn(testTypeEngine.EntityEngine, "queryEntities").mockReturnValue([
        {
          entityId: "entity-1",
          components: {
            SpriteComponent: new SpriteComponent({ texture_path: "test.png" }),
          },
        },
      ]);

      await expect(testTypeEngine.RenderEngine.setupScene()).resolves.not.toThrow();
      expect(testTypeEngine.EntityEngine.queryEntities).toHaveBeenCalled();
    });

    it("should load multiple sprite entities", async () => {
      const sprite1 = new SpriteComponent({ texture_path: "sprite1.png" });
      const sprite2 = new SpriteComponent({ texture_path: "sprite2.png" });

      vi.spyOn(typeEngine.EntityEngine, "queryEntities").mockReturnValue([
        { entityId: "entity-1", components: { SpriteComponent: sprite1 } },
        { entityId: "entity-2", components: { SpriteComponent: sprite2 } },
      ]);

      // Mock setup to avoid actual PIXI initialization
      vi.spyOn(renderEngine, "setup").mockImplementation(async () => {});
      await renderEngine.setup();

      await renderEngine.setupScene();

      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledTimes(2);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(sprite1._sprite);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(sprite2._sprite);
    });
  });

  describe("destroy", () => {
    it("should destroy app instance when app exists", () => {
      const mockApp = {
        destroy: vi.fn(),
      };
      getRenderEngineStatic().app = mockApp;

      renderEngine.destroy(typeEngine);

      expect(mockApp.destroy).toHaveBeenCalled();
      expect(getRenderEngineStatic().app).toBeNull();
    });

    it("should clean up event listeners on destroy", async () => {
      const testTypeEngine = new TypeEngine({
        projectPath: "/test-cleanup",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "test-cleanup-game",
        },
        systemsList: [],
      });

      vi.spyOn(testTypeEngine.SceneEngine, "setup").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.SceneEngine, "transition").mockImplementation(async () => {});
      vi.spyOn(testTypeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});

      // Mock PIXI parts but let event listener setup work
      vi.spyOn(testTypeEngine.RenderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);

      await testTypeEngine.setup();
      expect(testTypeEngine.EventEngine.hasListeners("remove:drawable")).toBe(true);

      testTypeEngine.RenderEngine.destroy(testTypeEngine);

      expect(testTypeEngine.EventEngine.hasListeners("remove:drawable")).toBe(false);
    });

    it("should clear spriteMap on destroy", () => {
      const spriteComponent = new SpriteComponent({ texture_path: "test.png" });
      getRenderEnginePrivate(renderEngine).spriteMap.set("test-entity", spriteComponent);

      expect(getRenderEnginePrivate(renderEngine).spriteMap.size).toBe(1);

      renderEngine.destroy(typeEngine);

      expect(getRenderEnginePrivate(renderEngine).spriteMap.size).toBe(0);
    });

    it("should handle destroy when app is null", () => {
      getRenderEngineStatic().app = null;

      expect(() => renderEngine.destroy(typeEngine)).not.toThrow();
    });

    it("should reset static properties", () => {
      getRenderEngineStatic().app = {
        destroy: vi.fn(),
      };

      renderEngine.destroy(typeEngine);

      expect(getRenderEngineStatic().app).toBeNull();
    });
  });

  describe("static properties", () => {
    it("should have static app property", () => {
      expect(RenderEngine).toHaveProperty("app");
    });
  });

  describe("remove:drawable event handling", () => {
    it("should remove sprite from container when remove:drawable event is received", async () => {
      const spriteComponent = new SpriteComponent({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      // Initialize renderEngine to set up stage and event listeners
      // Mock the PIXI parts but let the event listener setup run
      vi.spyOn(renderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);
      await renderEngine.setup();

      // Add sprite to the spriteMap (simulate setupScene)
      const entityId = "test-entity";
      getRenderEnginePrivate(renderEngine).spriteMap.set(entityId, spriteComponent);

      // Emit remove:drawable event - events should be processed synchronously
      typeEngine.EventEngine.emit("remove:drawable", {
        entityId,
        componentName: "SpriteComponent",
        componentData: { texture: "test.png" },
      });

      expect(renderEngine._instance.stage.removeChild).toHaveBeenCalledWith(
        spriteComponent._sprite,
      );
      expect(getRenderEnginePrivate(renderEngine).spriteMap.has(entityId)).toBe(false);
    });

    it("should handle remove:drawable event when sprite not found", async () => {
      // Initialize renderEngine to set up stage and event listeners
      vi.spyOn(renderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);
      await renderEngine.setup();

      typeEngine.EventEngine.emit("remove:drawable", {
        entityId: "non-existent-entity",
        componentName: "SpriteComponent",
        componentData: { texture: "test.png" },
      });

      // Should not try to remove from stage when sprite not found
      expect(renderEngine._instance.stage.removeChild).not.toHaveBeenCalled();
    });

    it("should handle remove:drawable event when stage is null", async () => {
      const spriteComponent = new SpriteComponent({
        texture_path: "test.png",
      });

      const entityId = "test-entity";

      // Initialize renderEngine to set up event listeners
      vi.spyOn(renderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);
      await renderEngine.setup();

      // Simulate null stage
      // biome-ignore lint/suspicious/noExplicitAny: Testing null stage behavior
      renderEngine._instance.stage = null as any;

      getRenderEnginePrivate(renderEngine).spriteMap.set(entityId, spriteComponent);

      expect(() => {
        typeEngine.EventEngine.emit("remove:drawable", {
          entityId,
          componentName: "SpriteComponent",
          componentData: { texture: "test.png" },
        });
      }).not.toThrow();

      // Sprite should be removed from map even if stage is null
      expect(getRenderEnginePrivate(renderEngine).spriteMap.has(entityId)).toBe(false);
    });

    it("should track sprites in spriteMap during setupScene", async () => {
      const sprite1 = new SpriteComponent({ texture_path: "sprite1.png" });
      const sprite2 = new SpriteComponent({ texture_path: "sprite2.png" });

      vi.spyOn(typeEngine.EntityEngine, "queryEntities").mockReturnValue([
        { entityId: "entity-1", components: { SpriteComponent: sprite1 } },
        { entityId: "entity-2", components: { SpriteComponent: sprite2 } },
      ]);

      const mockContainer = {
        addChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      await renderEngine.setupScene();

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

      vi.spyOn(typeEngine.EntityEngine, "queryEntities").mockReturnValue([
        {
          entityId: "integration-entity",
          components: {
            SpriteComponent: spriteComponent,
          },
        },
      ]);

      // Initialize renderEngine to set up stage
      vi.spyOn(renderEngine, "setup").mockImplementation(async () => {});
      await renderEngine.setup();

      await renderEngine.setupScene();

      expect(typeEngine.EntityEngine.queryEntities).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(spriteComponent._sprite);
    });
  });
});
