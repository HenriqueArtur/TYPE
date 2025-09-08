import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MouseComponent } from "../../Component/Input/MouseComponent";
import type { TypeEngine } from "../../TypeEngine";
import { TypeEngineMock } from "../../TyprEngine.mock";
import { MouseSystem } from "./MouseSystem";

// Mock DOM APIs
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  MouseEvent: class MockMouseEvent {
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    button: number;

    // biome-ignore lint/suspicious/noExplicitAny: Mock constructor requires any for options
    constructor(_type: string, options: any = {}) {
      this.screenX = options.screenX || 0;
      this.screenY = options.screenY || 0;
      this.clientX = options.clientX || 0;
      this.clientY = options.clientY || 0;
      this.button = options.button || 0;
    }
  },
  WheelEvent: class MockWheelEvent {
    deltaX: number;
    deltaY: number;
    deltaZ: number;

    // biome-ignore lint/suspicious/noExplicitAny: Mock constructor requires any for options
    constructor(_type: string, options: any = {}) {
      this.deltaX = options.deltaX || 0;
      this.deltaY = options.deltaY || 0;
      this.deltaZ = options.deltaZ || 0;
    }
  },
};

Object.defineProperty(global, "window", {
  value: mockWindow,
  writable: true,
});

// @ts-expect-error - Mock MouseEvent for testing
global.MouseEvent = mockWindow.MouseEvent;
// @ts-expect-error - Mock WheelEvent for testing
global.WheelEvent = mockWindow.WheelEvent;

describe("MouseSystem", () => {
  let mouseSystem: MouseSystem;
  let mockEngine: TypeEngine;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset window mock to ensure clean state
    Object.defineProperty(global, "window", {
      value: mockWindow,
      writable: true,
    });
    mouseSystem = new MouseSystem();
    mockEngine = await TypeEngineMock();
    mockEngine.EntityEngine.query = vi.fn().mockReturnValue([]);
  });

  describe("System Properties", () => {
    it("should have correct system properties", () => {
      expect(mouseSystem.name).toBe("MouseSystem");
      expect(mouseSystem.priority).toBe(1);
      expect(mouseSystem.enabled).toBe(true);
    });
  });

  describe("init", () => {
    it("should register mouse event listeners on window", async () => {
      await mouseSystem.init(mockEngine);

      expect(mockWindow.addEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith("mouseup", expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith("wheel", expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith("contextmenu", expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledTimes(5);
    });

    it("should handle environment without window", async () => {
      // @ts-expect-error - Testing undefined window
      global.window = undefined;

      expect(async () => await mouseSystem.init(mockEngine)).not.toThrow();
    });
  });

  describe("update", () => {
    it("should update mouse component data from tracked state", () => {
      const mockMouseComponent: MouseComponent = {
        screenPosition: { x: 0, y: 0 },
        windowPosition: { x: 0, y: 0 },
        buttons: { left: false, right: false, middle: false },
        wheel: { deltaX: 0, deltaY: 0, deltaZ: 0 },
      };

      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([
        {
          entityId: "entity1",
          components: {
            MouseComponent: [mockMouseComponent],
          },
        },
      ]);

      // Simulate mouse state changes by directly accessing private properties
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      (mouseSystem as any).mouse_position_screen = { x: 100, y: 200 };
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      (mouseSystem as any).mouse_position_window = { x: 50, y: 75 };
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      (mouseSystem as any).mouse_buttons = { left: true, right: false, middle: true };
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      (mouseSystem as any).mouse_wheel = { deltaX: 5, deltaY: -10, deltaZ: 0 };

      mouseSystem.update(mockEngine, 16);

      expect(mockMouseComponent.screenPosition).toEqual({ x: 100, y: 200 });
      expect(mockMouseComponent.windowPosition).toEqual({ x: 50, y: 75 });
      expect(mockMouseComponent.buttons).toEqual({ left: true, right: false, middle: true });
      expect(mockMouseComponent.wheel).toEqual({ deltaX: 5, deltaY: -10, deltaZ: 0 });
    });

    it("should handle multiple entities with MouseComponent", () => {
      const mockMouseComponent1: MouseComponent = {
        screenPosition: { x: 0, y: 0 },
        windowPosition: { x: 0, y: 0 },
        buttons: { left: false, right: false, middle: false },
        wheel: { deltaX: 0, deltaY: 0, deltaZ: 0 },
      };

      const mockMouseComponent2: MouseComponent = {
        screenPosition: { x: 0, y: 0 },
        windowPosition: { x: 0, y: 0 },
        buttons: { left: false, right: false, middle: false },
        wheel: { deltaX: 0, deltaY: 0, deltaZ: 0 },
      };

      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([
        {
          entityId: "entity1",
          components: {
            MouseComponent: [mockMouseComponent1, mockMouseComponent2],
          },
        },
      ]);

      // Simulate mouse state
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      (mouseSystem as any).mouse_position_screen = { x: 150, y: 250 };
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      (mouseSystem as any).mouse_position_window = { x: 75, y: 125 };

      mouseSystem.update(mockEngine, 16);

      expect(mockMouseComponent1.screenPosition).toEqual({ x: 150, y: 250 });
      expect(mockMouseComponent1.windowPosition).toEqual({ x: 75, y: 125 });
      expect(mockMouseComponent2.screenPosition).toEqual({ x: 150, y: 250 });
      expect(mockMouseComponent2.windowPosition).toEqual({ x: 75, y: 125 });
    });

    it("should query entities with MouseComponent", () => {
      mockEngine.EntityEngine.query = vi.fn().mockReturnValue([]);

      mouseSystem.update(mockEngine, 16);

      expect(mockEngine.EntityEngine.query).toHaveBeenCalledWith(["MouseComponent"]);
    });
  });

  describe("destroy", () => {
    it("should call removeEventListener when handlers are bound", async () => {
      await mouseSystem.init(mockEngine);
      vi.clearAllMocks(); // Clear init calls

      mouseSystem.destroy(mockEngine);

      // Should call removeEventListener for all bound handlers (mousemove, mousedown, mouseup, wheel, contextmenu)
      expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(5);
    });

    it("should handle environment without window", () => {
      // @ts-expect-error - Testing undefined window
      global.window = undefined;

      expect(() => mouseSystem.destroy(mockEngine)).not.toThrow();
    });
  });

  describe("Mouse Event Handling", () => {
    beforeEach(async () => {
      await mouseSystem.init(mockEngine);
    });

    it("should track mouse position from mousemove events", () => {
      const mouseEvent = new MouseEvent("mousemove", {
        screenX: 300,
        screenY: 400,
        clientX: 150,
        clientY: 200,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      const privateSystem = mouseSystem as any;
      // Call the private method directly since boundHandleMouseMove is only available after init
      privateSystem.handleMouseMove(mouseEvent);

      expect(privateSystem.mouse_position_screen).toEqual({ x: 300, y: 400 });
      expect(privateSystem.mouse_position_window).toEqual({ x: 150, y: 200 });
    });

    it("should track mouse button down events", () => {
      const leftClick = new MouseEvent("mousedown", { button: 0 });
      const rightClick = new MouseEvent("mousedown", { button: 2 });
      const middleClick = new MouseEvent("mousedown", { button: 1 });

      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      const privateSystem = mouseSystem as any;
      privateSystem.handleMouseDown(leftClick);
      privateSystem.handleMouseDown(rightClick);
      privateSystem.handleMouseDown(middleClick);

      expect(privateSystem.mouse_buttons).toEqual({ left: true, right: true, middle: true });
    });

    it("should track mouse button up events", () => {
      // First set buttons as pressed
      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      const privateSystem = mouseSystem as any;
      privateSystem.mouse_buttons = { left: true, right: true, middle: true };

      const leftClick = new MouseEvent("mouseup", { button: 0 });
      const rightClick = new MouseEvent("mouseup", { button: 2 });
      const middleClick = new MouseEvent("mouseup", { button: 1 });

      privateSystem.handleMouseUp(leftClick);
      privateSystem.handleMouseUp(rightClick);
      privateSystem.handleMouseUp(middleClick);

      expect(privateSystem.mouse_buttons).toEqual({ left: false, right: false, middle: false });
    });

    it("should track wheel events", () => {
      const wheelEvent = new WheelEvent("wheel", {
        deltaX: 10,
        deltaY: -20,
        deltaZ: 5,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      const privateSystem = mouseSystem as any;
      privateSystem.handleWheel(wheelEvent);

      expect(privateSystem.mouse_wheel).toEqual({ deltaX: 10, deltaY: -20, deltaZ: 5 });
    });

    it("should reset wheel deltas after timeout", async () => {
      const wheelEvent = new WheelEvent("wheel", {
        deltaX: 10,
        deltaY: -20,
        deltaZ: 5,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Testing private properties requires any
      const privateSystem = mouseSystem as any;
      privateSystem.handleWheel(wheelEvent);

      expect(privateSystem.mouse_wheel).toEqual({ deltaX: 10, deltaY: -20, deltaZ: 5 });

      // Wait for setTimeout to execute
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(privateSystem.mouse_wheel).toEqual({ deltaX: 0, deltaY: 0, deltaZ: 0 });
    });
  });
});
