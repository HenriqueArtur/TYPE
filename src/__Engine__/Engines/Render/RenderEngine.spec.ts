import type { Container } from "pixi.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Drawable } from "../../Component/Drawable/__type__";
import { SPRITE_COMPONENT } from "../../Component/Drawable/SpriteComponent";
import { TypeEngine } from "../../TypeEngine";
import { setupBasicTypeEngineMocks, TypeEngineMock } from "../../TyprEngine.mock";
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
    drawablesMap: Map<string, Map<string, Drawable<Container, unknown>[]>>;
  };

// Mock document and DOM elements
const mockCanvas = { tagName: "CANVAS" };
const mockGameDiv = {
  appendChild: vi.fn(),
  children: {
    0: mockCanvas,
    length: 1,
    [Symbol.iterator]: function* () {
      yield mockCanvas;
    },
  },
};

global.document = {
  getElementById: vi.fn((id: string) => {
    if (id === "game") return mockGameDiv;
    return null;
  }),
} as unknown as Document;

// Mock Electron API
global.window = {
  electronAPI: {
    absolutePath: vi.fn().mockImplementation(async (path: string) => `file://${path}`),
  },
} as unknown as Window & typeof globalThis;

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
    typeEngine = await TypeEngineMock();
    renderEngine = typeEngine.RenderEngine;
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
      });

      setupBasicTypeEngineMocks(customTypeEngine);

      await customTypeEngine.setup();
      expect(customTypeEngine.RenderEngine._instance).toBeDefined();
    });

    it("should set up event listeners for drawable events", async () => {
      const testTypeEngine = new TypeEngine({
        projectPath: "/test-listeners",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "test-listeners-game",
        },
      });

      setupBasicTypeEngineMocks(testTypeEngine);

      // Mock PIXI initialization but let event listener setup work
      vi.spyOn(testTypeEngine.RenderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);

      // Actually call the real setup method for RenderEngine to test event listeners
      (testTypeEngine.RenderEngine.setup as ReturnType<typeof vi.fn>).mockRestore();

      await testTypeEngine.setup();

      expect(testTypeEngine.EventEngine.hasListeners("remove:drawable")).toBe(true);
      expect(testTypeEngine.EventEngine.getListenerCount("remove:drawable")).toBe(1);
      expect(testTypeEngine.EventEngine.hasListeners("add:drawable")).toBe(true);
      expect(testTypeEngine.EventEngine.getListenerCount("add:drawable")).toBe(1);
    });

    it("should append canvas to DOM element", async () => {
      // Create a fresh render engine and call setup directly
      const freshTypeEngine = new TypeEngine({
        projectPath: "/test-dom",
        Render: {
          width: 800,
          height: 600,
          html_tag_id: "game",
        },
      });

      // Mock PIXI initialization
      vi.spyOn(freshTypeEngine.RenderEngine._instance, "init").mockImplementation(async () => {});

      // Create a fresh spy after the fresh engine is created
      const freshMockGameDiv = {
        appendChild: vi.fn(),
      } as unknown as HTMLElement;

      vi.spyOn(document, "getElementById").mockReturnValue(freshMockGameDiv);

      await freshTypeEngine.RenderEngine.setup();

      expect(freshMockGameDiv.appendChild).toHaveBeenCalled();
    });
  });

  describe("setupScene", () => {
    it("should handle empty sprite entities", async () => {
      vi.spyOn(typeEngine.EntityEngine, "query").mockReturnValue([]);

      await expect(renderEngine.setupScene()).resolves.not.toThrow();
    });

    it("should load sprites from engine entities", async () => {
      const mockSpriteComponent = SPRITE_COMPONENT.create({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      vi.spyOn(typeEngine.EntityEngine, "query").mockReturnValue([
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

      expect(typeEngine.EntityEngine.query).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(
        mockSpriteComponent._drawable,
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
      });

      setupBasicTypeEngineMocks(testTypeEngine);

      await testTypeEngine.setup();
      await testTypeEngine.RenderEngine.setup();

      vi.spyOn(testTypeEngine.EntityEngine, "query").mockReturnValue([
        {
          entityId: "entity-1",
          components: {
            SpriteComponent: SPRITE_COMPONENT.create({ texture_path: "test.png" }),
          },
        },
      ]);

      await expect(testTypeEngine.RenderEngine.setupScene()).resolves.not.toThrow();
      expect(testTypeEngine.EntityEngine.query).toHaveBeenCalled();
    });

    it("should load multiple sprite entities", async () => {
      const sprite1 = SPRITE_COMPONENT.create({ texture_path: "sprite1.png" });
      const sprite2 = SPRITE_COMPONENT.create({ texture_path: "sprite2.png" });

      vi.spyOn(typeEngine.EntityEngine, "query").mockReturnValue([
        { entityId: "entity-1", components: { SpriteComponent: sprite1 } },
        { entityId: "entity-2", components: { SpriteComponent: sprite2 } },
      ]);

      // Mock setup to avoid actual PIXI initialization
      vi.spyOn(renderEngine, "setup").mockImplementation(async () => {});
      await renderEngine.setup();

      await renderEngine.setupScene();

      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledTimes(2);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(sprite1._drawable);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(sprite2._drawable);
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
      });

      setupBasicTypeEngineMocks(testTypeEngine);

      // Mock PIXI parts but let event listener setup work
      vi.spyOn(testTypeEngine.RenderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);

      // Actually call the real setup method for RenderEngine to test event listeners
      (testTypeEngine.RenderEngine.setup as ReturnType<typeof vi.fn>).mockRestore();

      await testTypeEngine.setup();
      expect(testTypeEngine.EventEngine.hasListeners("remove:drawable")).toBe(true);
      expect(testTypeEngine.EventEngine.hasListeners("add:drawable")).toBe(true);

      testTypeEngine.RenderEngine.destroy(testTypeEngine);

      expect(testTypeEngine.EventEngine.hasListeners("remove:drawable")).toBe(false);
      expect(testTypeEngine.EventEngine.hasListeners("add:drawable")).toBe(false);
    });

    it("should clear drawablesMap on destroy", () => {
      const spriteComponent = SPRITE_COMPONENT.create({ texture_path: "test.png" });
      const componentsMap = new Map();
      componentsMap.set("SpriteComponent", [spriteComponent]);
      getRenderEnginePrivate(renderEngine).drawablesMap.set("test-entity", componentsMap);

      expect(getRenderEnginePrivate(renderEngine).drawablesMap.size).toBe(1);

      renderEngine.destroy(typeEngine);

      expect(getRenderEnginePrivate(renderEngine).drawablesMap.size).toBe(0);
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
      const spriteComponent = SPRITE_COMPONENT.create({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      // Add sprite to the drawablesMap (simulate setupScene)
      const entityId = "test-entity";
      const renderEnginePrivate = getRenderEnginePrivate(renderEngine);
      const componentsMap = new Map();
      componentsMap.set("SpriteComponent", [spriteComponent]);
      renderEnginePrivate.drawablesMap.set(entityId, componentsMap);

      // Call the private handleRemoveDrawable method directly
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private method for testing
      const handleRemoveDrawable = (renderEngine as any).handleRemoveDrawable;
      handleRemoveDrawable.call(renderEngine, {
        entityId,
        componentName: "SpriteComponent",
        componentData: spriteComponent,
      });

      expect(renderEngine._instance.stage.removeChild).toHaveBeenCalledWith(
        spriteComponent._drawable,
      );
      expect(renderEnginePrivate.drawablesMap.has(entityId)).toBe(false);
    });

    it("should handle remove:drawable event when sprite not found", async () => {
      // Initialize renderEngine to set up stage and event listeners
      vi.spyOn(renderEngine._instance, "init").mockImplementation(async () => {});
      vi.spyOn(document, "getElementById").mockReturnValue(null);
      await renderEngine.setup();

      const nonExistentComponent = SPRITE_COMPONENT.create({ texture_path: "test.png" });
      typeEngine.EventEngine.emit("remove:drawable", {
        entityId: "non-existent-entity",
        componentName: "SpriteComponent",
        componentData: nonExistentComponent,
      });

      // Should not try to remove from stage when sprite not found
      expect(renderEngine._instance.stage.removeChild).not.toHaveBeenCalled();
    });

    it("should handle remove:drawable event when stage is null", async () => {
      const spriteComponent = SPRITE_COMPONENT.create({
        texture_path: "test.png",
      });

      const entityId = "test-entity";

      // Simulate null stage
      // biome-ignore lint/suspicious/noExplicitAny: Testing null stage behavior
      renderEngine._instance.stage = null as any;

      const renderEnginePrivate = getRenderEnginePrivate(renderEngine);
      const componentsMap = new Map();
      componentsMap.set("SpriteComponent", [spriteComponent]);
      renderEnginePrivate.drawablesMap.set(entityId, componentsMap);

      // Call the private handleRemoveDrawable method directly
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private method for testing
      const handleRemoveDrawable = (renderEngine as any).handleRemoveDrawable;

      expect(() => {
        handleRemoveDrawable.call(renderEngine, {
          entityId,
          componentName: "SpriteComponent",
          componentData: spriteComponent,
        });
      }).not.toThrow();

      // Sprite should be removed from map even if stage is null
      expect(renderEnginePrivate.drawablesMap.has(entityId)).toBe(false);
    });

    it("should track sprites in drawablesMap during setupScene", async () => {
      const sprite1 = SPRITE_COMPONENT.create({ texture_path: "sprite1.png" });
      const sprite2 = SPRITE_COMPONENT.create({ texture_path: "sprite2.png" });

      vi.spyOn(typeEngine.EntityEngine, "query").mockReturnValue([
        { entityId: "entity-1", components: { SpriteComponent: sprite1 } },
        { entityId: "entity-2", components: { SpriteComponent: sprite2 } },
      ]);

      const mockContainer = {
        addChild: vi.fn(),
      };
      getRenderEngineStatic().container = mockContainer;

      await renderEngine.setupScene();

      expect(getRenderEnginePrivate(renderEngine).drawablesMap.size).toBe(2);

      const entity1Components = getRenderEnginePrivate(renderEngine).drawablesMap.get("entity-1");
      expect(entity1Components?.get("SpriteComponent")?.[0]).toBe(sprite1);

      const entity2Components = getRenderEnginePrivate(renderEngine).drawablesMap.get("entity-2");
      expect(entity2Components?.get("SpriteComponent")?.[0]).toBe(sprite2);
    });
  });

  describe("add:drawable event handling", () => {
    it("should add sprite to container when add:drawable event is received", async () => {
      const spriteComponent = SPRITE_COMPONENT.create({
        texture_path: "test.png",
        position: { x: 10, y: 20 },
      });

      const entityId = "test-entity";
      const renderEnginePrivate = getRenderEnginePrivate(renderEngine);

      // Call the private handleAddDrawable method directly
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private method for testing
      const handleAddDrawable = (renderEngine as any).handleAddDrawable;
      await handleAddDrawable.call(renderEngine, {
        entityId,
        componentName: "SpriteComponent",
        componentData: spriteComponent,
      });

      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(spriteComponent._drawable);

      const entityComponents = renderEnginePrivate.drawablesMap.get(entityId);
      expect(entityComponents?.get("SpriteComponent")?.[0]).toBe(spriteComponent);
    });

    it("should handle add:drawable event for multiple components", async () => {
      const sprite1 = SPRITE_COMPONENT.create({ texture_path: "sprite1.png" });
      const sprite2 = SPRITE_COMPONENT.create({ texture_path: "sprite2.png" });

      const entityId = "test-entity";
      const renderEnginePrivate = getRenderEnginePrivate(renderEngine);

      // biome-ignore lint/suspicious/noExplicitAny: Accessing private method for testing
      const handleAddDrawable = (renderEngine as any).handleAddDrawable;

      // Add first sprite
      await handleAddDrawable.call(renderEngine, {
        entityId,
        componentName: "SpriteComponent",
        componentData: sprite1,
      });

      // Add second sprite of same type
      await handleAddDrawable.call(renderEngine, {
        entityId,
        componentName: "SpriteComponent",
        componentData: sprite2,
      });

      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledTimes(2);

      const entityComponents = renderEnginePrivate.drawablesMap.get(entityId);
      const spriteComponents = entityComponents?.get("SpriteComponent");
      expect(spriteComponents).toHaveLength(2);
      expect(spriteComponents?.[0]).toBe(sprite1);
      expect(spriteComponents?.[1]).toBe(sprite2);
    });

    it("should handle add:drawable event when entity does not exist", async () => {
      const spriteComponent = SPRITE_COMPONENT.create({ texture_path: "new.png" });
      const entityId = "new-entity";
      const renderEnginePrivate = getRenderEnginePrivate(renderEngine);

      // biome-ignore lint/suspicious/noExplicitAny: Accessing private method for testing
      const handleAddDrawable = (renderEngine as any).handleAddDrawable;
      await handleAddDrawable.call(renderEngine, {
        entityId,
        componentName: "SpriteComponent",
        componentData: spriteComponent,
      });

      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(spriteComponent._drawable);

      expect(renderEnginePrivate.drawablesMap.has(entityId)).toBe(true);
      const entityComponents = renderEnginePrivate.drawablesMap.get(entityId);
      expect(entityComponents?.get("SpriteComponent")?.[0]).toBe(spriteComponent);
    });
  });

  describe("integration", () => {
    it("should work with TypeEngine sprite query", async () => {
      const spriteComponent = SPRITE_COMPONENT.create({
        texture_path: "integration.png",
        position: { x: 100, y: 200 },
        scale: { x: 2, y: 2 },
        rotation: 1.5,
        alpha: 0.8,
        visible: true,
      });

      vi.spyOn(typeEngine.EntityEngine, "query").mockReturnValue([
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

      expect(typeEngine.EntityEngine.query).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(renderEngine._instance.stage.addChild).toHaveBeenCalledWith(spriteComponent._drawable);
    });
  });
});
