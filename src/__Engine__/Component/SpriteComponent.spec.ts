import { Assets, Sprite, type Texture } from "pixi.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Angle } from "../Utils/Angle";
import {
  SpriteComponent,
  type SpriteComponentData,
  type SpriteComponentDataJson,
} from "./SpriteComponent";
import { TextureComponent } from "./TextureComponent";

// Mock PIXI.js modules

vi.mock("pixi.js", () => ({
  Sprite: vi.fn().mockImplementation((config) => {
    const instance = {
      position: { x: config?.position?.x || 0, y: config?.position?.y || 0 },
      scale: { x: config?.scale?.x || 1, y: config?.scale?.y || 1 },
      rotation: config?.rotation || 0,
      anchor: config?.anchor || 0,
      texture: config?.texture || null,
    };
    return instance;
  }),
  Assets: {
    load: vi.fn(),
  },
}));

const mockTexture = { width: 100, height: 100 } as Texture;

describe("SpriteComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Assets.load as ReturnType<typeof vi.fn>).mockResolvedValue(mockTexture);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create sprite component with texture and default transform", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const spriteData: SpriteComponentData = {
        texture: textureComponent,
      };

      const sprite = new SpriteComponent(spriteData);

      expect(sprite.texture).toBe(textureComponent);
      expect(sprite.type).toBe("SpriteComponent");
    });

    it("should create sprite component with texture and custom transform", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const spriteData: SpriteComponentData = {
        texture: textureComponent,
        position: { x: 50, y: 75 },
        scale: { x: 2, y: 1.5 },
        rotation: Angle.fromDegrees(45),
      };

      const sprite = new SpriteComponent(spriteData);
      const transformValue = sprite._transform.value();

      expect(sprite.texture).toBe(textureComponent);
      expect(transformValue.position.x).toBe(50);
      expect(transformValue.position.y).toBe(75);
      expect(transformValue.scale.x).toBe(2);
      expect(transformValue.scale.y).toBe(1.5);
      expect(transformValue.rotation.degrees).toBeCloseTo(45);
    });

    it("should create sprite component with partial transform data", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const spriteData: SpriteComponentData = {
        texture: textureComponent,
        position: { x: 10 },
      };

      const sprite = new SpriteComponent(spriteData);
      const transformValue = sprite._transform.value();

      expect(transformValue.position.x).toBe(10);
      expect(transformValue.position.y).toBe(0);
      expect(transformValue.scale.x).toBe(1);
      expect(transformValue.scale.y).toBe(1);
    });
  });

  describe("static properties", () => {
    it("should have correct type identifier", () => {
      expect(SpriteComponent._type).toBe("SpriteComponent");
    });

    it("should have correct prefix", () => {
      expect(SpriteComponent.prefix).toBe("SP");
    });
  });

  describe("transform method", () => {
    it("should update transform component and sprite instance position", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      sprite.transform({ position: { x: 100, y: 200 } });

      // Verify transform component was updated
      const transformValue = sprite._transform.value();
      expect(transformValue.position.x).toBe(100);
      expect(transformValue.position.y).toBe(200);
    });

    it("should update transform component and sprite instance scale", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      sprite.transform({ scale: { x: 2.5, y: 0.8 } });

      // Verify transform component was updated
      const transformValue = sprite._transform.value();
      expect(transformValue.scale.x).toBe(2.5);
      expect(transformValue.scale.y).toBe(0.8);
    });

    it("should update transform component and sprite instance rotation", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      const angle = Angle.fromDegrees(90);
      sprite.transform({ rotation: angle });

      // Verify transform component was updated
      const transformValue = sprite._transform.value();
      expect(transformValue.rotation.degrees).toBeCloseTo(90);
    });

    it("should update multiple transform properties", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      const angle = Angle.fromDegrees(45);
      sprite.transform({
        position: { x: 50, y: 75 },
        scale: { x: 1.5, y: 2.0 },
        rotation: angle,
      });

      // Verify transform component was updated
      const transformValue = sprite._transform.value();
      expect(transformValue.position.x).toBe(50);
      expect(transformValue.position.y).toBe(75);
      expect(transformValue.scale.x).toBe(1.5);
      expect(transformValue.scale.y).toBe(2.0);
      expect(transformValue.rotation.degrees).toBeCloseTo(45);
    });

    it("should handle partial position updates", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({
        texture: textureComponent,
        position: { x: 10, y: 20 },
      });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      sprite.transform({ position: { x: 100 } });

      // Verify transform component was updated
      const transformValue = sprite._transform.value();
      expect(transformValue.position.x).toBe(100);
      expect(transformValue.position.y).toBe(20); // y should remain unchanged
    });

    it("should handle partial scale updates", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({
        texture: textureComponent,
        scale: { x: 2, y: 3 },
      });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      sprite.transform({ scale: { y: 5 } });

      // Verify transform component was updated
      const transformValue = sprite._transform.value();
      expect(transformValue.scale.y).toBe(5);
      expect(transformValue.scale.x).toBe(2); // x should remain unchanged
    });
  });

  describe("load method", () => {
    it("should load texture and create sprite instance", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      // Mock the texture component load method
      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      const instance = await sprite.load();

      expect(textureComponent.load).toHaveBeenCalled();
      expect(Sprite).toHaveBeenCalledWith({
        texture: mockTexture,
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        anchor: 0.5,
      });
      expect(instance).toBeInstanceOf(Object);
    });

    it("should create sprite with correct transform values", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const angle = Angle.fromDegrees(30);
      const sprite = new SpriteComponent({
        texture: textureComponent,
        position: { x: 25, y: 35 },
        scale: { x: 1.5, y: 0.8 },
        rotation: angle,
      });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      await sprite.load();

      expect(Sprite).toHaveBeenCalledWith({
        texture: mockTexture,
        position: { x: 25, y: 35 },
        scale: { x: 1.5, y: 0.8 },
        rotation: expect.closeTo(30, 5),
        anchor: 0.5,
      });
    });

    it("should set anchor to 0.5 by default", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      await sprite.load();

      expect(Sprite).toHaveBeenCalledWith(expect.objectContaining({ anchor: 0.5 }));
    });
  });

  describe("instance method", () => {
    it("should return sprite instance after loading", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      const loadedInstance = await sprite.load();
      const getInstance = sprite.instance();

      expect(getInstance).toBe(loadedInstance);
    });

    it("should return sprite instance even before explicit load call", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      // This should work even if load() hasn't been called yet
      // (though in practice instance might be null)
      expect(() => sprite.instance()).not.toThrow();
    });
  });

  describe("jsonToGameObject static method", () => {
    it("should create sprite component from JSON string", () => {
      const jsonData: SpriteComponentDataJson = {
        texture: "bunny.png",
        position: { x: 10, y: 20 },
        scale: { x: 1.5, y: 2.0 },
        rotation: 45,
      };

      const sprite = SpriteComponent.jsonToGameObject(JSON.stringify(jsonData));
      const transformValue = sprite._transform.value();

      expect(sprite.texture.path).toBe("../bunny.png");
      expect(transformValue.position.x).toBe(10);
      expect(transformValue.position.y).toBe(20);
      expect(transformValue.scale.x).toBe(1.5);
      expect(transformValue.scale.y).toBe(2.0);
      expect(transformValue.rotation.degrees).toBeCloseTo(45);
    });

    it("should create sprite component from object", () => {
      const objectData: SpriteComponentDataJson = {
        texture: "sprite.png",
        rotation: 90,
      };

      const sprite = SpriteComponent.jsonToGameObject(objectData);
      const transformValue = sprite._transform.value();

      expect(sprite.texture.path).toBe("../sprite.png");
      expect(transformValue.rotation.degrees).toBeCloseTo(90);
    });

    it("should handle minimal data with defaults", () => {
      const minimalData: SpriteComponentDataJson = {
        texture: "minimal.png",
        rotation: 0,
      };

      const sprite = SpriteComponent.jsonToGameObject(minimalData);
      const transformValue = sprite._transform.value();

      expect(sprite.texture.path).toBe("../minimal.png");
      expect(transformValue.position.x).toBe(0);
      expect(transformValue.position.y).toBe(0);
      expect(transformValue.scale.x).toBe(1);
      expect(transformValue.scale.y).toBe(1);
      expect(transformValue.rotation.degrees).toBe(0);
    });

    it("should handle negative rotation values", () => {
      const data: SpriteComponentDataJson = {
        texture: "test.png",
        rotation: -45,
      };

      const sprite = SpriteComponent.jsonToGameObject(data);
      const transformValue = sprite._transform.value();

      expect(transformValue.rotation.degrees).toBeCloseTo(-45);
    });

    it("should handle malformed JSON gracefully", () => {
      expect(() => {
        SpriteComponent.jsonToGameObject("invalid json");
      }).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle zero scale values", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({
        texture: textureComponent,
        scale: { x: 0, y: 0 },
      });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      await sprite.load();

      expect(Sprite).toHaveBeenCalledWith({
        texture: mockTexture,
        position: { x: 0, y: 0 },
        scale: { x: 0, y: 0 },
        rotation: 0,
        anchor: 0.5,
      });
    });

    it("should handle negative position values", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({
        texture: textureComponent,
        position: { x: -100, y: -50 },
      });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      await sprite.load();

      expect(Sprite).toHaveBeenCalledWith({
        texture: mockTexture,
        position: { x: -100, y: -50 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        anchor: 0.5,
      });
    });

    it("should handle very large rotation values", () => {
      const data: SpriteComponentDataJson = {
        texture: "test.png",
        rotation: 720, // Two full rotations
      };

      const sprite = SpriteComponent.jsonToGameObject(data);
      const transformValue = sprite._transform.value();

      expect(transformValue.rotation.degrees).toBeCloseTo(720);
    });

    it("should handle floating point precision in transforms", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      const preciseAngle = Angle.fromDegrees(33.333333);
      sprite.transform({
        position: { x: 12.345678, y: 98.765432 },
        scale: { x: 1.111111, y: 2.222222 },
        rotation: preciseAngle,
      });

      // Verify transform component was updated with precision
      const transformValue = sprite._transform.value();
      expect(transformValue.position.x).toBeCloseTo(12.345678, 6);
      expect(transformValue.position.y).toBeCloseTo(98.765432, 6);
      expect(transformValue.scale.x).toBeCloseTo(1.111111, 6);
      expect(transformValue.scale.y).toBeCloseTo(2.222222, 6);
      expect(transformValue.rotation.degrees).toBeCloseTo(33.333333, 5);
    });
  });

  describe("destroy", () => {
    it("should have destroy method defined", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      expect(typeof sprite.destroy).toBe("function");
    });

    it("should call destroy without errors", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      expect(() => sprite.destroy()).not.toThrow();
    });

    it("should destroy sprite instance and remove from parent", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      const mockParent = {
        removeChild: vi.fn(),
      };

      const mockSpriteInstance = {
        parent: mockParent,
        destroy: vi.fn(),
      };

      // Mock the Sprite constructor to return our mock instance
      (Sprite as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSpriteInstance);

      await sprite.load();
      sprite.destroy();

      expect(mockParent.removeChild).toHaveBeenCalledWith(mockSpriteInstance);
      expect(mockSpriteInstance.destroy).toHaveBeenCalled();
    });

    it("should handle destroy when sprite has no parent", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);

      const mockSpriteInstance = {
        parent: null,
        destroy: vi.fn(),
      };

      (Sprite as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSpriteInstance);

      await sprite.load();
      sprite.destroy();

      expect(mockSpriteInstance.destroy).toHaveBeenCalled();
    });

    it("should be callable multiple times without errors", async () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      vi.spyOn(textureComponent, "load").mockResolvedValue(mockTexture);
      await sprite.load();

      expect(() => {
        sprite.destroy();
        sprite.destroy();
        sprite.destroy();
      }).not.toThrow();
    });

    it("should handle destroy before sprite is loaded", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const sprite = new SpriteComponent({ texture: textureComponent });

      expect(() => sprite.destroy()).not.toThrow();
    });

    it("should call texture component destroy", () => {
      const textureComponent = new TextureComponent({ path: "test.png" });
      const destroySpy = vi.spyOn(textureComponent, "destroy");
      const sprite = new SpriteComponent({ texture: textureComponent });

      sprite.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
