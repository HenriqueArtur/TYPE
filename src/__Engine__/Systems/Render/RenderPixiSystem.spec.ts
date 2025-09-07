import { beforeEach, describe, expect, it, vi } from "vitest";
import { SPRITE_COMPONENT } from "../../Component/Drawable/SpriteComponent";
import type { TypeEngine } from "../../TypeEngine";
import { RenderPixiSystem } from "./RenderPixiSystem";

// Mock document for RenderEngine
global.document = {
  getElementById: vi.fn((id: string) => {
    if (id === "game") return { appendChild: vi.fn() };
    return null;
  }),
} as unknown as Document;

// Mock PIXI.js modules
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
    position: {
      x: 0,
      y: 0,
      set: vi.fn(),
    },
    scale: {
      x: 1,
      y: 1,
      set: vi.fn(),
    },
    rotation: 0,
    alpha: 1,
    visible: true,
    anchor: {
      x: 0.5,
      y: 0.5,
      set: vi.fn(),
    },
    tint: 0xffffff,
  })),
  Texture: {
    EMPTY: {},
  },
}));

describe("RenderPixiSystem", () => {
  let system: RenderPixiSystem;
  let mockEngine: TypeEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    system = new RenderPixiSystem();

    mockEngine = {
      EntityEngine: {
        queryEntities: vi.fn().mockReturnValue([]),
      },
    } as unknown as TypeEngine;
  });

  describe("System interface implementation", () => {
    it("should implement System interface correctly", () => {
      expect(system.priority).toBe(2);
      expect(system.enabled).toBe(true);
      expect(typeof system.init).toBe("function");
      expect(typeof system.update).toBe("function");
      expect(typeof system.destroy).toBe("function");
    });
  });

  describe("init method", () => {
    it("should initialize without errors", async () => {
      await expect(system.init(mockEngine)).resolves.not.toThrow();
    });

    it("should handle init gracefully", async () => {
      // The init method is now empty and should not throw
      await expect(system.init(mockEngine)).resolves.toBeUndefined();
    });
  });

  describe("update method", () => {
    it("should update sprite properties when sprites exist", () => {
      const mockSprite = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
        anchor: { set: vi.fn() },
        rotation: 0,
        alpha: 1,
        visible: true,
        tint: 0xffffff,
      };

      const mockSpriteComponent = {
        _drawable: mockSprite,
        position: { x: 100, y: 200 },
        scale: { x: 2, y: 3 },
        rotation: 1.5,
        alpha: 0.8,
        visible: false,
        anchor: 0.7,
        tint: 0xff0000,
      };

      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([
        {
          components: {
            SpriteComponent: mockSpriteComponent,
          },
        },
      ]);

      system.update(mockEngine, 16.67);

      expect(mockEngine.EntityEngine.query).toHaveBeenCalledWith(["SpriteComponent"]);
      expect(mockSprite.position.set).toHaveBeenCalledWith(100, 200);
      expect(mockSprite.scale.set).toHaveBeenCalledWith(2, 3);
      expect(mockSprite.anchor.set).toHaveBeenCalledWith(0.7);
      expect(mockSprite.rotation).toBe(1.5);
      expect(mockSprite.alpha).toBe(0.8);
      expect(mockSprite.visible).toBe(false);
      expect(mockSprite.tint).toBe(0xff0000);
    });

    it("should handle sprites without tint", () => {
      const mockSprite = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
        anchor: { set: vi.fn() },
        rotation: 0,
        alpha: 1,
        visible: true,
        tint: 0xffffff,
      };

      const mockSpriteComponent = {
        _drawable: mockSprite,
        position: { x: 50, y: 75 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        alpha: 1,
        visible: true,
        anchor: 0.5,
        tint: undefined,
      };

      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([
        {
          components: {
            SpriteComponent: mockSpriteComponent,
          },
        },
      ]);

      system.update(mockEngine, 16.67);

      expect(mockSprite.position.set).toHaveBeenCalledWith(50, 75);
      expect(mockSprite.scale.set).toHaveBeenCalledWith(1, 1);
      expect(mockSprite.anchor.set).toHaveBeenCalledWith(0.5);
      expect(mockSprite.rotation).toBe(0);
      expect(mockSprite.alpha).toBe(1);
      expect(mockSprite.visible).toBe(true);
      // Tint should not be modified when undefined
      expect(mockSprite.tint).toBe(0xffffff);
    });

    it("should handle empty sprite entities", () => {
      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([]);

      expect(() => system.update(mockEngine, 16.67)).not.toThrow();
      expect(mockEngine.EntityEngine.query).toHaveBeenCalledWith(["SpriteComponent"]);
    });

    it("should handle multiple sprites", () => {
      const mockSprite1 = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
        anchor: { set: vi.fn() },
        rotation: 0,
        alpha: 1,
        visible: true,
        tint: 0xffffff,
      };

      const mockSprite2 = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
        anchor: { set: vi.fn() },
        rotation: 0,
        alpha: 1,
        visible: true,
        tint: 0xffffff,
      };

      const mockSpriteComponent1 = {
        _drawable: mockSprite1,
        position: { x: 10, y: 20 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        alpha: 1,
        visible: true,
        anchor: 0.5,
        tint: 0x00ff00,
      };

      const mockSpriteComponent2 = {
        _drawable: mockSprite2,
        position: { x: 30, y: 40 },
        scale: { x: 2, y: 2 },
        rotation: 3.14,
        alpha: 0.5,
        visible: false,
        anchor: 0.8,
        tint: undefined,
      };

      mockEngine.EntityEngine.query = vi
        .fn()
        .mockReturnValue([
          { components: { SpriteComponent: mockSpriteComponent1 } },
          { components: { SpriteComponent: mockSpriteComponent2 } },
        ]);

      system.update(mockEngine, 16.67);

      // Check first sprite
      expect(mockSprite1.position.set).toHaveBeenCalledWith(10, 20);
      expect(mockSprite1.scale.set).toHaveBeenCalledWith(1, 1);
      expect(mockSprite1.anchor.set).toHaveBeenCalledWith(0.5);
      expect(mockSprite1.rotation).toBe(0);
      expect(mockSprite1.alpha).toBe(1);
      expect(mockSprite1.visible).toBe(true);
      expect(mockSprite1.tint).toBe(0x00ff00);

      // Check second sprite
      expect(mockSprite2.position.set).toHaveBeenCalledWith(30, 40);
      expect(mockSprite2.scale.set).toHaveBeenCalledWith(2, 2);
      expect(mockSprite2.anchor.set).toHaveBeenCalledWith(0.8);
      expect(mockSprite2.rotation).toBe(3.14);
      expect(mockSprite2.alpha).toBe(0.5);
      expect(mockSprite2.visible).toBe(false);
      // Tint should not be modified when undefined
      expect(mockSprite2.tint).toBe(0xffffff);
    });
  });

  describe("destroy method", () => {
    it("should not throw when called", () => {
      expect(() => system.destroy(mockEngine)).not.toThrow();
    });

    it("should be callable multiple times", () => {
      expect(() => {
        system.destroy(mockEngine);
        system.destroy(mockEngine);
        system.destroy(mockEngine);
      }).not.toThrow();
    });
  });

  describe("integration with SpriteComponent", () => {
    it("should work with real SpriteComponent instances", () => {
      const spriteComponent = SPRITE_COMPONENT.create({
        texture_path: "test.png",
        position: { x: 150, y: 250 },
        scale: { x: 1.5, y: 2.5 },
        rotation: 2.1,
        alpha: 0.7,
        visible: false,
        anchor: 0.9,
        tint: 0x0000ff,
      });

      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([
        {
          components: {
            SpriteComponent: spriteComponent,
          },
        },
      ]);

      system.update(mockEngine, 16.67);

      expect(spriteComponent._drawable.position.set).toHaveBeenCalledWith(150, 250);
      expect(spriteComponent._drawable.scale.set).toHaveBeenCalledWith(1.5, 2.5);
      expect(spriteComponent._drawable.anchor.set).toHaveBeenCalledWith(0.9);
      expect(spriteComponent._drawable.rotation).toBe(2.1);
      expect(spriteComponent._drawable.alpha).toBe(0.7);
      expect(spriteComponent._drawable.visible).toBe(false);
      expect(spriteComponent._drawable.tint).toBe(0x0000ff);
    });
  });
});
