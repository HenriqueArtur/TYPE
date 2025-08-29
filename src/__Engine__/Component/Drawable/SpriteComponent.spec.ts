import { describe, expect, it } from "vitest";
import { SpriteComponent, type SpriteComponentData } from "./SpriteComponent";

describe("SpriteComponent", () => {
  describe("constructor", () => {
    it("should create sprite component with texture path and default values", () => {
      const spriteData: SpriteComponentData = {
        texture_path: "test.png",
      };

      const sprite = new SpriteComponent(spriteData);

      expect(sprite.texture_path).toBe("../test.png");
      expect(sprite.position).toEqual({ x: 0, y: 0 });
      expect(sprite.scale).toEqual({ x: 1, y: 1 });
      expect(sprite.rotation).toBe(0);
      expect(sprite.alpha).toBe(1);
      expect(sprite.tint).toBeUndefined();
      expect(sprite.visible).toBe(true);
      expect(sprite.anchor).toBe(0.5);
      expect(sprite._sprite).toBeDefined();
    });

    it("should create sprite component with custom values", () => {
      const spriteData: SpriteComponentData = {
        texture_path: "custom.png",
        position: { x: 50, y: 75 },
        scale: { x: 2, y: 1.5 },
        rotation: 45,
        alpha: 0.8,
        tint: 0xff0000,
        visible: false,
        anchor: 0.8,
      };

      const sprite = new SpriteComponent(spriteData);

      expect(sprite.texture_path).toBe("../custom.png");
      expect(sprite.position).toEqual({ x: 50, y: 75 });
      expect(sprite.scale).toEqual({ x: 2, y: 1.5 });
      expect(sprite.rotation).toBe(45);
      expect(sprite.alpha).toBe(0.8);
      expect(sprite.tint).toBe(0xff0000);
      expect(sprite.visible).toBe(false);
      expect(sprite.anchor).toBe(0.8);
    });

    it("should create sprite component with partial data", () => {
      const spriteData: SpriteComponentData = {
        texture_path: "partial.png",
        position: { x: 10, y: 20 },
        alpha: 0.5,
      };

      const sprite = new SpriteComponent(spriteData);

      expect(sprite.texture_path).toBe("../partial.png");
      expect(sprite.position).toEqual({ x: 10, y: 20 });
      expect(sprite.scale).toEqual({ x: 1, y: 1 }); // default
      expect(sprite.rotation).toBe(0); // default
      expect(sprite.alpha).toBe(0.5);
      expect(sprite.tint).toBeUndefined(); // default
      expect(sprite.visible).toBe(true); // default
      expect(sprite.anchor).toBe(0.5); // default
    });
  });

  describe("formatTexturePath", () => {
    it("should format texture path correctly", () => {
      const sprite1 = new SpriteComponent({ texture_path: "test.png" });
      expect(sprite1.texture_path).toBe("../test.png");

      const sprite2 = new SpriteComponent({ texture_path: "/assets/test.png" });
      expect(sprite2.texture_path).toBe("../assets/test.png");
    });

    it("should throw error for empty texture path", () => {
      expect(() => {
        new SpriteComponent({ texture_path: "" });
      }).toThrow("Texture path must be a non-empty string");
    });
  });

  describe("PIXI Sprite integration", () => {
    it("should initialize PIXI Sprite with component properties", () => {
      const spriteData: SpriteComponentData = {
        texture_path: "test.png",
        position: { x: 10, y: 20 },
        scale: { x: 1.5, y: 2.0 },
        rotation: 45,
        alpha: 0.9,
        tint: 0x00ff00,
        visible: false,
        anchor: 0.8,
      };

      const sprite = new SpriteComponent(spriteData);

      expect(sprite._sprite.position.x).toBe(10);
      expect(sprite._sprite.position.y).toBe(20);
      expect(sprite._sprite.scale.x).toBe(1.5);
      expect(sprite._sprite.scale.y).toBe(2.0);
      expect(sprite._sprite.rotation).toBe(45);
      expect(sprite._sprite.alpha).toBe(0.9);
      expect(sprite._sprite.tint).toBe(0x00ff00);
      expect(sprite._sprite.visible).toBe(false);
      expect(sprite._sprite.anchor.x).toBe(0.8);
      expect(sprite._sprite.anchor.y).toBe(0.8);
    });

    it("should handle undefined tint correctly", () => {
      const sprite = new SpriteComponent({ texture_path: "test.png" });

      expect(sprite.tint).toBeUndefined();
      expect(typeof sprite._sprite.tint).toBe("number");
    });
  });

  describe("edge cases", () => {
    it("should handle zero scale values", () => {
      const sprite = new SpriteComponent({
        texture_path: "test.png",
        scale: { x: 0, y: 0 },
      });

      expect(sprite.scale).toEqual({ x: 0, y: 0 });
      expect(sprite._sprite.scale.x).toBe(0);
      expect(sprite._sprite.scale.y).toBe(0);
    });

    it("should handle negative position values", () => {
      const sprite = new SpriteComponent({
        texture_path: "test.png",
        position: { x: -100, y: -50 },
      });

      expect(sprite.position).toEqual({ x: -100, y: -50 });
      expect(sprite._sprite.position.x).toBe(-100);
      expect(sprite._sprite.position.y).toBe(-50);
    });

    it("should handle very large rotation values", () => {
      const sprite = new SpriteComponent({
        texture_path: "test.png",
        rotation: 720, // Two full rotations
      });

      expect(sprite.rotation).toBe(720);
      expect(sprite._sprite.rotation).toBe(720);
    });

    it("should handle floating point precision", () => {
      const sprite = new SpriteComponent({
        texture_path: "test.png",
        position: { x: 12.345678, y: 98.765432 },
        scale: { x: 1.111111, y: 2.222222 },
        rotation: 33.333333,
        alpha: 0.123456,
      });

      expect(sprite.position.x).toBeCloseTo(12.345678, 6);
      expect(sprite.position.y).toBeCloseTo(98.765432, 6);
      expect(sprite.scale.x).toBeCloseTo(1.111111, 6);
      expect(sprite.scale.y).toBeCloseTo(2.222222, 6);
      expect(sprite.rotation).toBeCloseTo(33.333333, 5);
      expect(sprite.alpha).toBeCloseTo(0.123456, 6);
    });

    it("should handle alpha boundary values", () => {
      const sprite1 = new SpriteComponent({
        texture_path: "test.png",
        alpha: 0,
      });

      const sprite2 = new SpriteComponent({
        texture_path: "test.png",
        alpha: 1,
      });

      expect(sprite1.alpha).toBe(0);
      expect(sprite2.alpha).toBe(1);
      expect(sprite1._sprite.alpha).toBe(0);
      expect(sprite2._sprite.alpha).toBe(1);
    });
  });

  describe("property validation", () => {
    it("should handle anchor boundary values", () => {
      const sprite1 = new SpriteComponent({
        texture_path: "test.png",
        anchor: 0,
      });
      const sprite2 = new SpriteComponent({
        texture_path: "test.png",
        anchor: 1,
      });

      expect(sprite1.anchor).toBe(0);
      expect(sprite2.anchor).toBe(1);
      expect(sprite1._sprite.anchor.x).toBe(0);
      expect(sprite2._sprite.anchor.x).toBe(1);
    });
  });
});
