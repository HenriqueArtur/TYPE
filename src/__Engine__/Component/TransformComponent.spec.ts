import { describe, expect, it } from "vitest";
import { Angle } from "../Utils/Angle";
import { TransformComponent, type TransformComponentData } from "./TransformComponent";

describe("TransformComponent", () => {
  describe("constructor", () => {
    it("should create component with default values when no data provided", () => {
      const transform = new TransformComponent();
      const value = transform.value();

      expect(value.position.x).toBe(0);
      expect(value.position.y).toBe(0);
      expect(value.scale.x).toBe(1);
      expect(value.scale.y).toBe(1);
      expect(value.rotation.degrees).toBe(0);
    });

    it("should create component with provided position values", () => {
      const data: TransformComponentData = {
        position: { x: 10, y: 20 },
      };
      const transform = new TransformComponent(data);
      const value = transform.value();

      expect(value.position.x).toBe(10);
      expect(value.position.y).toBe(20);
      expect(value.scale.x).toBe(1);
      expect(value.scale.y).toBe(1);
    });

    it("should create component with provided scale values", () => {
      const data: TransformComponentData = {
        scale: { x: 2, y: 3 },
      };
      const transform = new TransformComponent(data);
      const value = transform.value();

      expect(value.scale.x).toBe(2);
      expect(value.scale.y).toBe(3);
      expect(value.position.x).toBe(0);
      expect(value.position.y).toBe(0);
    });

    it("should create component with provided rotation value", () => {
      const angle = Angle.fromDegrees(45);
      const data: TransformComponentData = {
        rotation: angle,
      };
      const transform = new TransformComponent(data);
      const value = transform.value();

      expect(value.rotation.degrees).toBeCloseTo(45);
    });

    it("should create component with partial position data", () => {
      const data: TransformComponentData = {
        position: { x: 5 },
      };
      const transform = new TransformComponent(data);
      const value = transform.value();

      expect(value.position.x).toBe(5);
      expect(value.position.y).toBe(0);
    });

    it("should create component with partial scale data", () => {
      const data: TransformComponentData = {
        scale: { y: 2.5 },
      };
      const transform = new TransformComponent(data);
      const value = transform.value();

      expect(value.scale.x).toBe(1);
      expect(value.scale.y).toBe(2.5);
    });
  });

  describe("static properties", () => {
    it("should have correct type identifier", () => {
      expect(TransformComponent._type).toBe("TransformComponent");
      expect(new TransformComponent().type).toBe("TransformComponent");
    });

    it("should have correct prefix", () => {
      expect(TransformComponent.prefix).toBe("TR");
    });
  });

  describe("set method", () => {
    it("should update position values", () => {
      const transform = new TransformComponent();
      transform.set({ position: { x: 100, y: 200 } });
      const value = transform.value();

      expect(value.position.x).toBe(100);
      expect(value.position.y).toBe(200);
    });

    it("should update scale values", () => {
      const transform = new TransformComponent();
      transform.set({ scale: { x: 0.5, y: 2.0 } });
      const value = transform.value();

      expect(value.scale.x).toBe(0.5);
      expect(value.scale.y).toBe(2.0);
    });

    it("should update rotation value", () => {
      const transform = new TransformComponent();
      const newAngle = Angle.fromDegrees(90);
      transform.set({ rotation: newAngle });
      const value = transform.value();

      expect(value.rotation.degrees).toBeCloseTo(90);
    });

    it("should update partial position values", () => {
      const transform = new TransformComponent({ position: { x: 10, y: 20 } });
      transform.set({ position: { x: 30 } });
      const value = transform.value();

      expect(value.position.x).toBe(30);
      expect(value.position.y).toBe(20);
    });

    it("should update partial scale values", () => {
      const transform = new TransformComponent({ scale: { x: 2, y: 3 } });
      transform.set({ scale: { y: 4 } });
      const value = transform.value();

      expect(value.scale.x).toBe(2);
      expect(value.scale.y).toBe(4);
    });

    it("should update multiple properties at once", () => {
      const transform = new TransformComponent();
      const angle = Angle.fromDegrees(45);
      transform.set({
        position: { x: 50, y: 75 },
        scale: { x: 1.5, y: 2.5 },
        rotation: angle,
      });
      const value = transform.value();

      expect(value.position.x).toBe(50);
      expect(value.position.y).toBe(75);
      expect(value.scale.x).toBe(1.5);
      expect(value.scale.y).toBe(2.5);
      expect(value.rotation.degrees).toBeCloseTo(45);
    });

    it("should not modify original data objects", () => {
      const transform = new TransformComponent();
      const positionData = { x: 10, y: 20 };
      const scaleData = { x: 2, y: 3 };

      transform.set({ position: positionData, scale: scaleData });

      positionData.x = 999;
      scaleData.x = 999;

      const value = transform.value();
      expect(value.position.x).toBe(10);
      expect(value.scale.x).toBe(2);
    });
  });

  describe("value method", () => {
    it("should return deep copy of transform data", () => {
      const transform = new TransformComponent({
        position: { x: 10, y: 20 },
        scale: { x: 2, y: 3 },
      });

      const value1 = transform.value();
      const value2 = transform.value();

      expect(value1).not.toBe(value2);
      expect(value1.position).not.toBe(value2.position);
      expect(value1.scale).not.toBe(value2.scale);

      expect(value1.position.x).toBe(value2.position.x);
      expect(value1.position.y).toBe(value2.position.y);
      expect(value1.scale.x).toBe(value2.scale.x);
      expect(value1.scale.y).toBe(value2.scale.y);
    });

    it("should not allow external modification of internal state", () => {
      const transform = new TransformComponent({ position: { x: 10, y: 20 } });
      const value = transform.value();

      value.position.x = 999;

      const newValue = transform.value();
      expect(newValue.position.x).toBe(10);
    });
  });

  describe("jsonToGameObject static method", () => {
    it("should create component from JSON string", () => {
      const jsonData = JSON.stringify({
        position: { x: 15, y: 25 },
        scale: { x: 1.5, y: 2.0 },
        rotation: { _radians: Math.PI / 4 },
      });

      const transform = TransformComponent.jsonToGameObject(jsonData);
      const value = transform.value();

      expect(value.position.x).toBe(15);
      expect(value.position.y).toBe(25);
      expect(value.scale.x).toBe(1.5);
      expect(value.scale.y).toBe(2.0);
    });

    it("should create component from object", () => {
      const objectData = {
        position: { x: 30, y: 40 },
        scale: { x: 0.8, y: 1.2 },
      };

      const transform = TransformComponent.jsonToGameObject(objectData);
      const value = transform.value();

      expect(value.position.x).toBe(30);
      expect(value.position.y).toBe(40);
      expect(value.scale.x).toBe(0.8);
      expect(value.scale.y).toBe(1.2);
    });

    it("should handle empty object", () => {
      const transform = TransformComponent.jsonToGameObject({});
      const value = transform.value();

      expect(value.position.x).toBe(0);
      expect(value.position.y).toBe(0);
      expect(value.scale.x).toBe(1);
      expect(value.scale.y).toBe(1);
      expect(value.rotation.degrees).toBe(0);
    });

    it("should handle malformed JSON gracefully", () => {
      expect(() => {
        TransformComponent.jsonToGameObject("invalid json");
      }).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle negative position values", () => {
      const transform = new TransformComponent({
        position: { x: -100, y: -50 },
      });
      const value = transform.value();

      expect(value.position.x).toBe(-100);
      expect(value.position.y).toBe(-50);
    });

    it("should handle zero scale values", () => {
      const transform = new TransformComponent({
        scale: { x: 0, y: 0 },
      });
      const value = transform.value();

      expect(value.scale.x).toBe(0);
      expect(value.scale.y).toBe(0);
    });

    it("should handle very large numbers", () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const transform = new TransformComponent({
        position: { x: largeNumber, y: largeNumber },
      });
      const value = transform.value();

      expect(value.position.x).toBe(largeNumber);
      expect(value.position.y).toBe(largeNumber);
    });

    it("should handle floating point precision", () => {
      const precision_value = 0.123456789;
      const transform = new TransformComponent({
        position: { x: precision_value, y: precision_value },
      });
      const value = transform.value();

      expect(value.position.x).toBeCloseTo(precision_value, 9);
      expect(value.position.y).toBeCloseTo(precision_value, 9);
    });
  });
});
