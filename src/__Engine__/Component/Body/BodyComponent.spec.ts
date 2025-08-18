import { Bodies } from "matter-js";
import { describe, expect, it } from "vitest";
import { BodyComponent } from "./BodyComponent";

class TestBodyComponent extends BodyComponent {
  static readonly _type = "TestBodyComponent";
  readonly type = TestBodyComponent._type;

  protected createBody() {
    return Bodies.rectangle(0, 0, 10, 10, {
      isStatic: this.is_static,
      friction: this.friction,
      restitution: this.restitution,
      density: this.density,
    });
  }

  static jsonToGameObject(json: string | object): TestBodyComponent {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return new TestBodyComponent(data);
  }
}

describe("BodyComponent", () => {
  describe("constructor", () => {
    it("should create with default values when no data provided", () => {
      const component = new TestBodyComponent();

      expect(component.type).toBe("TestBodyComponent");
      expect(component.value()).toEqual({
        is_static: false,
        friction: 0.1,
        restitution: 0.3,
        density: 0.001,
      });
    });

    it("should create with provided data", () => {
      const data = {
        is_static: true,
        friction: 0.5,
        restitution: 0.8,
        density: 0.002,
      };
      const component = new TestBodyComponent(data);

      expect(component.value()).toEqual(data);
    });

    it("should create a Matter.js body", () => {
      const component = new TestBodyComponent();
      const body = component.getBody();

      expect(body).toBeDefined();
      expect(body.isStatic).toBe(false);
      expect(body.friction).toBe(0.1);
      expect(body.restitution).toBe(0.3);
      expect(body.density).toBe(0.001);
    });
  });

  describe("set", () => {
    it("should update is_static property", () => {
      const component = new TestBodyComponent();
      component.set({ is_static: true });

      expect(component.value().is_static).toBe(true);
      expect(component.getBody().isStatic).toBe(true);
    });

    it("should update friction property", () => {
      const component = new TestBodyComponent();
      component.set({ friction: 0.8 });

      expect(component.value().friction).toBe(0.8);
      expect(component.getBody().friction).toBe(0.8);
    });

    it("should update restitution property", () => {
      const component = new TestBodyComponent();
      component.set({ restitution: 0.9 });

      expect(component.value().restitution).toBe(0.9);
      expect(component.getBody().restitution).toBe(0.9);
    });

    it("should update density property", () => {
      const component = new TestBodyComponent();
      component.set({ density: 0.005 });

      expect(component.value().density).toBe(0.005);
      expect(component.getBody().density).toBe(0.005);
    });

    it("should update multiple properties at once", () => {
      const component = new TestBodyComponent();
      const updates = {
        is_static: true,
        friction: 0.7,
        restitution: 0.6,
        density: 0.003,
      };
      component.set(updates);

      expect(component.value()).toEqual(updates);
    });
  });

  describe("getBody", () => {
    it("should return the Matter.js body", () => {
      const component = new TestBodyComponent();
      const body = component.getBody();

      expect(body).toBeDefined();
      expect(typeof body).toBe("object");
    });
  });

  describe("setPosition", () => {
    it("should update the body position", () => {
      const component = new TestBodyComponent();
      const body = component.getBody();

      component.setPosition(100, 200);

      expect(body.position.x).toBe(100);
      expect(body.position.y).toBe(200);
    });

    it("should update position from initial position", () => {
      const component = new TestBodyComponent();
      const body = component.getBody();

      // Initial position should be (0, 0) from createBody
      expect(body.position.x).toBe(0);
      expect(body.position.y).toBe(0);

      component.setPosition(50, 75);

      expect(body.position.x).toBe(50);
      expect(body.position.y).toBe(75);
    });

    it("should handle negative coordinates", () => {
      const component = new TestBodyComponent();
      const body = component.getBody();

      component.setPosition(-25, -50);

      expect(body.position.x).toBe(-25);
      expect(body.position.y).toBe(-50);
    });

    it("should handle decimal coordinates", () => {
      const component = new TestBodyComponent();
      const body = component.getBody();

      component.setPosition(123.456, 789.123);

      expect(body.position.x).toBe(123.456);
      expect(body.position.y).toBe(789.123);
    });
  });

  describe("static methods", () => {
    it("should throw error when calling abstract jsonToGameObject", () => {
      expect(() => {
        BodyComponent.jsonToGameObject({});
      }).toThrow("Abstract method jsonToGameObject must be implemented by subclasses");
    });
  });
});
