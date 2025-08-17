import { describe, expect, it } from "vitest";
import { RectangularBodyComponent } from "./RectangularBodyComponent";

describe("RectangularBodyComponent", () => {
  describe("constructor", () => {
    it("should create with default values when no data provided", () => {
      const component = new RectangularBodyComponent();

      expect(component.type).toBe("RectangularBodyComponent");
      expect(component.value()).toEqual({
        is_static: false,
        friction: 0.1,
        restitution: 0.3,
        density: 0.001,
        width: 50,
        height: 50,
        x: 0,
        y: 0,
      });
    });

    it("should create with provided data", () => {
      const data = {
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

      expect(component.value()).toEqual(data);
    });

    it("should create rectangular Matter.js body with correct dimensions", () => {
      const component = new RectangularBodyComponent({
        width: 100,
        height: 200,
        x: 10,
        y: 20,
      });
      const body = component.getBody();

      expect(body).toBeDefined();
      expect(body.position.x).toBe(10);
      expect(body.position.y).toBe(20);
      expect(body.bounds.min.x).toBeLessThan(body.bounds.max.x);
      expect(body.bounds.min.y).toBeLessThan(body.bounds.max.y);
    });
  });

  describe("set", () => {
    it("should update width and height", () => {
      const component = new RectangularBodyComponent();
      component.set({ width: 150, height: 75 });

      expect(component.value().width).toBe(150);
      expect(component.value().height).toBe(75);
    });

    it("should update position", () => {
      const component = new RectangularBodyComponent();
      component.set({ x: 100, y: 200 });

      expect(component.value().x).toBe(100);
      expect(component.value().y).toBe(200);
      expect(component.getBody().position.x).toBe(100);
      expect(component.getBody().position.y).toBe(200);
    });

    it("should update body properties from parent class", () => {
      const component = new RectangularBodyComponent();
      component.set({ is_static: true, friction: 0.9 });

      expect(component.value().is_static).toBe(true);
      expect(component.value().friction).toBe(0.9);
      expect(component.getBody().isStatic).toBe(true);
      expect(component.getBody().friction).toBe(0.9);
    });

    it("should update multiple properties at once", () => {
      const component = new RectangularBodyComponent();
      const updates = {
        width: 80,
        height: 120,
        x: 50,
        y: 75,
        is_static: true,
        friction: 0.6,
      };
      component.set(updates);

      const value = component.value();
      expect(value.width).toBe(80);
      expect(value.height).toBe(120);
      expect(value.x).toBe(50);
      expect(value.y).toBe(75);
      expect(value.is_static).toBe(true);
      expect(value.friction).toBe(0.6);
    });
  });

  describe("jsonToGameObject", () => {
    it("should create component from JSON string", () => {
      const data = {
        width: 100,
        height: 200,
        x: 10,
        y: 20,
        is_static: true,
      };
      const json_string = JSON.stringify(data);
      const component = RectangularBodyComponent.jsonToGameObject(json_string);

      expect(component).toBeInstanceOf(RectangularBodyComponent);
      expect(component.value().width).toBe(100);
      expect(component.value().height).toBe(200);
      expect(component.value().is_static).toBe(true);
    });

    it("should create component from object", () => {
      const data = {
        width: 150,
        height: 300,
        friction: 0.8,
      };
      const component = RectangularBodyComponent.jsonToGameObject(data);

      expect(component).toBeInstanceOf(RectangularBodyComponent);
      expect(component.value().width).toBe(150);
      expect(component.value().height).toBe(300);
      expect(component.value().friction).toBe(0.8);
    });
  });

  describe("body physics properties", () => {
    it("should maintain body consistency after updates", () => {
      const component = new RectangularBodyComponent({ width: 50, height: 50 });
      const initial_body = component.getBody();
      const initial_area = initial_body.area;

      component.set({ width: 100, height: 100 });
      const updated_body = component.getBody();

      expect(updated_body).toBe(initial_body); // Same body reference
      expect(updated_body.area).toBeGreaterThan(initial_area); // Area should increase
    });

    it("should handle edge case values", () => {
      const component = new RectangularBodyComponent();

      // Test with very small values
      component.set({ width: 1, height: 1 });
      expect(component.value().width).toBe(1);
      expect(component.value().height).toBe(1);
      expect(component.getBody()).toBeDefined();

      // Test with large values
      component.set({ width: 1000, height: 2000 });
      expect(component.value().width).toBe(1000);
      expect(component.value().height).toBe(2000);
      expect(component.getBody()).toBeDefined();
    });
  });
});
