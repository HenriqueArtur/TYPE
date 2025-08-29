import { describe, expect, it } from "vitest";
import {
  RectangularBodyComponent,
  type RectangularBodyComponentData,
} from "./RectangularBodyComponent";

describe("RectangularBodyComponent", () => {
  describe("constructor", () => {
    it("should create with default values when no data provided", () => {
      const component = new RectangularBodyComponent();

      expect(component.type).toBe("RectangularBodyComponent");
      expect(component.width).toBe(50);
      expect(component.height).toBe(50);
      expect(component.x).toBe(0);
      expect(component.y).toBe(0);
      expect(component.is_static).toBe(false);
      expect(component.friction).toBe(0.3);
      expect(component.restitution).toBe(0.8);
      expect(component.density).toBe(1);
    });

    it("should create with provided data", () => {
      const data: RectangularBodyComponentData = {
        is_static: true,
        friction: 0.5,
        restitution: 0.8,
        density: 0.002,
        width: 100,
        height: 200,
        x: 10,
        y: 20,
      };
      const component = new RectangularBodyComponent(data);

      expect(component.width).toBe(100);
      expect(component.height).toBe(200);
      expect(component.x).toBe(10);
      expect(component.y).toBe(20);
      expect(component.is_static).toBe(true);
      expect(component.friction).toBe(0.5);
      expect(component.restitution).toBe(0.8);
      expect(component.density).toBe(0.002);
    });

    it("should create with partial data and use defaults", () => {
      const data: RectangularBodyComponentData = {
        width: 100,
        height: 200,
      };
      const component = new RectangularBodyComponent(data);

      expect(component.width).toBe(100);
      expect(component.height).toBe(200);
      expect(component.x).toBe(0); // default
      expect(component.y).toBe(0); // default
      expect(component.is_static).toBe(false); // default
      expect(component.friction).toBe(0.3); // default
    });
  });

  describe("static properties", () => {
    it("should have correct type identifier", () => {
      expect(RectangularBodyComponent._type).toBe("RectangularBodyComponent");
    });

    it("should have correct prefix", () => {
      expect(RectangularBodyComponent.prefix).toBe("RBD");
    });
  });

  describe("jsonToGameObject", () => {
    it("should create component from JSON string", () => {
      const data: RectangularBodyComponentData = {
        width: 100,
        height: 200,
        x: 10,
        y: 20,
        is_static: true,
      };
      const json_string = JSON.stringify(data);
      const component = RectangularBodyComponent.jsonToGameObject(json_string);

      expect(component).toBeInstanceOf(RectangularBodyComponent);
      expect(component.width).toBe(100);
      expect(component.height).toBe(200);
      expect(component.x).toBe(10);
      expect(component.y).toBe(20);
      expect(component.is_static).toBe(true);
    });

    it("should create component from object", () => {
      const data: RectangularBodyComponentData = {
        width: 150,
        height: 300,
        friction: 0.8,
      };
      const component = RectangularBodyComponent.jsonToGameObject(data);

      expect(component).toBeInstanceOf(RectangularBodyComponent);
      expect(component.width).toBe(150);
      expect(component.height).toBe(300);
      expect(component.friction).toBe(0.8);
      expect(component.x).toBe(0); // default
      expect(component.y).toBe(0); // default
    });

    it("should handle empty data", () => {
      const component = RectangularBodyComponent.jsonToGameObject({});

      expect(component).toBeInstanceOf(RectangularBodyComponent);
      expect(component.width).toBe(50);
      expect(component.height).toBe(50);
      expect(component.x).toBe(0);
      expect(component.y).toBe(0);
    });

    it("should handle malformed JSON gracefully", () => {
      expect(() => {
        RectangularBodyComponent.jsonToGameObject("invalid json");
      }).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle zero dimensions", () => {
      const component = new RectangularBodyComponent({
        width: 0,
        height: 0,
      });

      expect(component.width).toBe(0);
      expect(component.height).toBe(0);
    });

    it("should handle negative coordinates", () => {
      const component = new RectangularBodyComponent({
        x: -75,
        y: -125,
      });

      expect(component.x).toBe(-75);
      expect(component.y).toBe(-125);
    });

    it("should handle decimal values", () => {
      const component = new RectangularBodyComponent({
        width: 123.45,
        height: 67.89,
        x: 12.34,
        y: 56.78,
        friction: 0.123,
        restitution: 0.456,
        density: 0.789,
      });

      expect(component.width).toBeCloseTo(123.45, 2);
      expect(component.height).toBeCloseTo(67.89, 2);
      expect(component.x).toBeCloseTo(12.34, 2);
      expect(component.y).toBeCloseTo(56.78, 2);
      expect(component.friction).toBeCloseTo(0.123, 3);
      expect(component.restitution).toBeCloseTo(0.456, 3);
      expect(component.density).toBeCloseTo(0.789, 3);
    });

    it("should handle very large values", () => {
      const component = new RectangularBodyComponent({
        width: 1000000,
        height: 2000000,
        x: 500000,
        y: 750000,
      });

      expect(component.width).toBe(1000000);
      expect(component.height).toBe(2000000);
      expect(component.x).toBe(500000);
      expect(component.y).toBe(750000);
    });

    it("should handle boundary physics values", () => {
      const component1 = new RectangularBodyComponent({
        friction: 0,
        restitution: 0,
        density: 0,
      });

      const component2 = new RectangularBodyComponent({
        friction: 1,
        restitution: 1,
        density: 1,
      });

      expect(component1.friction).toBe(0);
      expect(component1.restitution).toBe(0);
      expect(component1.density).toBe(0);

      expect(component2.friction).toBe(1);
      expect(component2.restitution).toBe(1);
      expect(component2.density).toBe(1);
    });
  });

  describe("immutability", () => {
    it("should have readonly properties", () => {
      const component = new RectangularBodyComponent({
        width: 100,
        height: 200,
      });

      // These should not compile if properties are not readonly
      // but we can test the descriptor
      const descriptor = Object.getOwnPropertyDescriptor(component, "width");
      expect(descriptor?.writable).toBe(false);
    });

    it("should not allow modification of properties", () => {
      const component = new RectangularBodyComponent({
        width: 100,
        height: 200,
      });

      // These operations should fail silently or throw in strict mode
      // @ts-expect-error - testing readonly behavior
      expect(() => {
        component.width = 300;
      }).not.toThrow();
      expect(component.width).toBe(100); // Value should remain unchanged
    });
  });
});
