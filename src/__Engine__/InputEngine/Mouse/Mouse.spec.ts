import { describe, expect, it } from "vitest";
import { Mouse } from "./index";

describe("Mouse", () => {
  describe("constructor", () => {
    it("should create mouse with default position (0, 0)", () => {
      const mouse = new Mouse();

      expect(mouse.position.x).toBe(0);
      expect(mouse.position.y).toBe(0);
    });

    it("should initialize position as an object with x and y properties", () => {
      const mouse = new Mouse();

      expect(mouse.position).toHaveProperty("x");
      expect(mouse.position).toHaveProperty("y");
      expect(typeof mouse.position.x).toBe("number");
      expect(typeof mouse.position.y).toBe("number");
    });
  });

  describe("position property", () => {
    it("should allow reading position values", () => {
      const mouse = new Mouse();

      const { x, y } = mouse.position;

      expect(x).toBe(0);
      expect(y).toBe(0);
    });

    it("should allow modifying position values", () => {
      const mouse = new Mouse();

      mouse.position.x = 100;
      mouse.position.y = 200;

      expect(mouse.position.x).toBe(100);
      expect(mouse.position.y).toBe(200);
    });

    it("should allow setting negative position values", () => {
      const mouse = new Mouse();

      mouse.position.x = -50;
      mouse.position.y = -75;

      expect(mouse.position.x).toBe(-50);
      expect(mouse.position.y).toBe(-75);
    });

    it("should allow setting floating point position values", () => {
      const mouse = new Mouse();

      mouse.position.x = 123.456;
      mouse.position.y = 789.012;

      expect(mouse.position.x).toBeCloseTo(123.456, 3);
      expect(mouse.position.y).toBeCloseTo(789.012, 3);
    });

    it("should allow setting zero position values", () => {
      const mouse = new Mouse();

      mouse.position.x = 50;
      mouse.position.y = 100;

      // Reset to zero
      mouse.position.x = 0;
      mouse.position.y = 0;

      expect(mouse.position.x).toBe(0);
      expect(mouse.position.y).toBe(0);
    });

    it("should maintain independent x and y values", () => {
      const mouse = new Mouse();

      mouse.position.x = 25;

      expect(mouse.position.x).toBe(25);
      expect(mouse.position.y).toBe(0);

      mouse.position.y = 75;

      expect(mouse.position.x).toBe(25);
      expect(mouse.position.y).toBe(75);
    });
  });

  describe("multiple instances", () => {
    it("should create independent mouse instances", () => {
      const mouse1 = new Mouse();
      const mouse2 = new Mouse();

      mouse1.position.x = 10;
      mouse1.position.y = 20;

      mouse2.position.x = 30;
      mouse2.position.y = 40;

      expect(mouse1.position.x).toBe(10);
      expect(mouse1.position.y).toBe(20);
      expect(mouse2.position.x).toBe(30);
      expect(mouse2.position.y).toBe(40);
    });

    it("should not share position objects between instances", () => {
      const mouse1 = new Mouse();
      const mouse2 = new Mouse();

      expect(mouse1.position).not.toBe(mouse2.position);

      mouse1.position.x = 100;

      expect(mouse1.position.x).toBe(100);
      expect(mouse2.position.x).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle very large position values", () => {
      const mouse = new Mouse();
      const largeValue = Number.MAX_SAFE_INTEGER;

      mouse.position.x = largeValue;
      mouse.position.y = largeValue;

      expect(mouse.position.x).toBe(largeValue);
      expect(mouse.position.y).toBe(largeValue);
    });

    it("should handle very small position values", () => {
      const mouse = new Mouse();
      const smallValue = Number.MIN_SAFE_INTEGER;

      mouse.position.x = smallValue;
      mouse.position.y = smallValue;

      expect(mouse.position.x).toBe(smallValue);
      expect(mouse.position.y).toBe(smallValue);
    });

    it("should handle precision with very small decimal values", () => {
      const mouse = new Mouse();
      const preciseValue = 0.000001;

      mouse.position.x = preciseValue;
      mouse.position.y = preciseValue;

      expect(mouse.position.x).toBeCloseTo(preciseValue, 6);
      expect(mouse.position.y).toBeCloseTo(preciseValue, 6);
    });

    it("should handle Infinity values", () => {
      const mouse = new Mouse();

      mouse.position.x = Infinity;
      mouse.position.y = -Infinity;

      expect(mouse.position.x).toBe(Infinity);
      expect(mouse.position.y).toBe(-Infinity);
    });

    it("should handle NaN values", () => {
      const mouse = new Mouse();

      mouse.position.x = NaN;
      mouse.position.y = NaN;

      expect(mouse.position.x).toBeNaN();
      expect(mouse.position.y).toBeNaN();
    });
  });

  describe("position object immutability", () => {
    it("should allow position object replacement", () => {
      const mouse = new Mouse();
      const originalPosition = mouse.position;

      mouse.position = { x: 50, y: 100 };

      expect(mouse.position).not.toBe(originalPosition);
      expect(mouse.position.x).toBe(50);
      expect(mouse.position.y).toBe(100);
    });

    it("should maintain position object structure after replacement", () => {
      const mouse = new Mouse();

      mouse.position = { x: 25, y: 75 };

      expect(mouse.position).toHaveProperty("x");
      expect(mouse.position).toHaveProperty("y");
      expect(typeof mouse.position.x).toBe("number");
      expect(typeof mouse.position.y).toBe("number");
    });
  });

  describe("type consistency", () => {
    it("should always maintain number types for position coordinates", () => {
      const mouse = new Mouse();

      // Initial state
      expect(typeof mouse.position.x).toBe("number");
      expect(typeof mouse.position.y).toBe("number");

      // After modification
      mouse.position.x = 42;
      mouse.position.y = 84;

      expect(typeof mouse.position.x).toBe("number");
      expect(typeof mouse.position.y).toBe("number");
    });

    it("should handle type coercion for non-number assignments", () => {
      const mouse = new Mouse();

      // TypeScript would prevent this, but testing runtime behavior
      // Using bracket notation to bypass TypeScript checking
      mouse.position.x = "50" as unknown as number;
      mouse.position.y = "100" as unknown as number;

      expect(mouse.position.x).toBe("50");
      expect(mouse.position.y).toBe("100");
    });
  });

  describe("realistic usage scenarios", () => {
    it("should support typical mouse coordinate ranges", () => {
      const mouse = new Mouse();

      // Common screen resolutions
      const coordinates = [
        { x: 0, y: 0 }, // Top-left corner
        { x: 1920, y: 1080 }, // Full HD
        { x: 2560, y: 1440 }, // 2K
        { x: 3840, y: 2160 }, // 4K
      ];

      coordinates.forEach((coord) => {
        mouse.position.x = coord.x;
        mouse.position.y = coord.y;

        expect(mouse.position.x).toBe(coord.x);
        expect(mouse.position.y).toBe(coord.y);
      });
    });

    it("should handle rapid position updates", () => {
      const mouse = new Mouse();
      const updates = 1000;

      for (let i = 0; i < updates; i++) {
        mouse.position.x = i;
        mouse.position.y = i * 2;
      }

      expect(mouse.position.x).toBe(updates - 1);
      expect(mouse.position.y).toBe((updates - 1) * 2);
    });

    it("should support mouse movement tracking", () => {
      const mouse = new Mouse();
      const path = [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
        { x: 20, y: 15 },
        { x: 15, y: 25 },
        { x: 5, y: 20 },
      ];

      const recordedPath: Array<{ x: number; y: number }> = [];

      path.forEach((point) => {
        mouse.position.x = point.x;
        mouse.position.y = point.y;
        recordedPath.push({ x: mouse.position.x, y: mouse.position.y });
      });

      expect(recordedPath).toEqual(path);
    });
  });

  describe("integration readiness", () => {
    it("should be compatible with game object update interface", () => {
      const mouse = new Mouse();

      // Simulate what might happen in a game object update
      const deltaTime = 16.67; // 60 FPS

      mouse.position.x = 100;
      mouse.position.y = 200;

      // The mouse object should be usable in GameObjectUpdate context
      const updateData = {
        deltaTime,
        mouse,
      };

      expect(updateData.mouse).toBe(mouse);
      expect(updateData.mouse.position.x).toBe(100);
      expect(updateData.mouse.position.y).toBe(200);
    });

    it("should support serialization for state management", () => {
      const mouse = new Mouse();

      mouse.position.x = 150;
      mouse.position.y = 250;

      const serialized = JSON.stringify(mouse.position);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.x).toBe(150);
      expect(deserialized.y).toBe(250);
    });
  });
});
