import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "../EventBus";
import { EventHandlerComponent, type EventHandlerData } from "./EventHandlerComponent";

describe("EventHandlerComponent", () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  describe("initialization", () => {
    it("should create with empty handlers when no data provided", () => {
      const component = new EventHandlerComponent();

      expect(component.getHandlers()).toEqual({});
      expect(component.getHandledEvents()).toEqual([]);
    });

    it("should create with provided handlers", () => {
      const handlers: EventHandlerData = {
        "test:event": vi.fn(),
        "another:event": vi.fn(),
      };
      const component = new EventHandlerComponent({ handlers });

      expect(component.getHandlers()).toEqual(handlers);
      expect(component.getHandledEvents()).toEqual(["test:event", "another:event"]);
    });

    it("should initialize without EventBus connection", () => {
      const handlers: EventHandlerData = {
        "test:event": vi.fn(),
      };
      const component = new EventHandlerComponent({ handlers });

      expect(component.hasHandler("test:event")).toBe(true);
    });
  });

  describe("EventBus integration", () => {
    it("should connect to EventBus and subscribe to existing handlers", () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();
      const component = new EventHandlerComponent({
        handlers: { "test:event": handler },
      });

      component.init(eventBus);
      eventBus.emit("test:event", "data");
      eventBus.processEvents();

      expect(handler).toHaveBeenCalledWith("data");
    });

    it("should subscribe to multiple events", () => {
      const eventBus = EventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const component = new EventHandlerComponent({
        handlers: {
          event1: handler1,
          event2: handler2,
        },
      });

      component.init(eventBus);
      eventBus.emit("event1", "data1");
      eventBus.emit("event2", "data2");
      eventBus.processEvents();

      expect(handler1).toHaveBeenCalledWith("data1");
      expect(handler2).toHaveBeenCalledWith("data2");
    });

    it("should not crash when init is called with null EventBus", () => {
      const component = new EventHandlerComponent({
        handlers: { "test:event": vi.fn() },
      });

      expect(() => component.init(null as unknown as EventBus)).not.toThrow();
    });
  });

  describe("handler management", () => {
    it("should add new handler", () => {
      const component = new EventHandlerComponent();
      const handler = vi.fn();

      component.addHandler("new:event", handler);

      expect(component.hasHandler("new:event")).toBe(true);
      expect(component.getHandler("new:event")).toBe(handler);
      expect(component.getHandledEvents()).toContain("new:event");
    });

    it("should add handler and subscribe immediately when EventBus is connected", () => {
      const eventBus = EventBus.getInstance();
      const component = new EventHandlerComponent();
      const handler = vi.fn();

      component.init(eventBus);
      component.addHandler("new:event", handler);

      eventBus.emit("new:event", "test-data");
      eventBus.processEvents();

      expect(handler).toHaveBeenCalledWith("test-data");
    });

    it("should remove handler", () => {
      const component = new EventHandlerComponent({
        handlers: { "test:event": vi.fn() },
      });

      component.removeHandler("test:event");

      expect(component.hasHandler("test:event")).toBe(false);
      expect(component.getHandler("test:event")).toBeUndefined();
      expect(component.getHandledEvents()).not.toContain("test:event");
    });

    it("should unsubscribe from EventBus when removing handler", () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();
      const component = new EventHandlerComponent({
        handlers: { "test:event": handler },
      });

      component.init(eventBus);
      component.removeHandler("test:event");

      eventBus.emit("test:event", "data");
      eventBus.processEvents();

      expect(handler).not.toHaveBeenCalled();
    });

    it("should not crash when removing non-existent handler", () => {
      const component = new EventHandlerComponent();

      expect(() => component.removeHandler("non:existent")).not.toThrow();
    });

    it("should replace existing handler when adding with same event name", () => {
      const eventBus = EventBus.getInstance();
      const oldHandler = vi.fn();
      const newHandler = vi.fn();
      const component = new EventHandlerComponent({
        handlers: { "test:event": oldHandler },
      });

      component.init(eventBus);
      component.addHandler("test:event", newHandler);

      eventBus.emit("test:event", "data");
      eventBus.processEvents();

      expect(oldHandler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledWith("data");
    });
  });

  describe("bulk handler operations", () => {
    it("should set all handlers and subscribe to EventBus", () => {
      const eventBus = EventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const component = new EventHandlerComponent();

      component.init(eventBus);
      component.setHandlers({
        event1: handler1,
        event2: handler2,
      });

      eventBus.emit("event1", "data1");
      eventBus.emit("event2", "data2");
      eventBus.processEvents();

      expect(handler1).toHaveBeenCalledWith("data1");
      expect(handler2).toHaveBeenCalledWith("data2");
      expect(component.getHandledEvents()).toEqual(["event1", "event2"]);
    });

    it("should unsubscribe from old handlers when setting new ones", () => {
      const eventBus = EventBus.getInstance();
      const oldHandler = vi.fn();
      const newHandler = vi.fn();
      const component = new EventHandlerComponent({
        handlers: { "old:event": oldHandler },
      });

      component.init(eventBus);
      component.setHandlers({ "new:event": newHandler });

      eventBus.emit("old:event", "old-data");
      eventBus.emit("new:event", "new-data");
      eventBus.processEvents();

      expect(oldHandler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledWith("new-data");
    });

    it("should return copy of handlers to prevent external modification", () => {
      const handlers: EventHandlerData = { "test:event": vi.fn() };
      const component = new EventHandlerComponent({ handlers });

      const returnedHandlers = component.getHandlers();
      returnedHandlers["modified:event"] = vi.fn();

      expect(component.hasHandler("modified:event")).toBe(false);
    });
  });

  describe("utility methods", () => {
    it("should check if handler exists", () => {
      const component = new EventHandlerComponent({
        handlers: { "existing:event": vi.fn() },
      });

      expect(component.hasHandler("existing:event")).toBe(true);
      expect(component.hasHandler("non:existent")).toBe(false);
    });

    it("should get specific handler function", () => {
      const handler = vi.fn();
      const component = new EventHandlerComponent({
        handlers: { "test:event": handler },
      });

      expect(component.getHandler("test:event")).toBe(handler);
      expect(component.getHandler("non:existent")).toBeUndefined();
    });

    it("should get list of handled event names", () => {
      const component = new EventHandlerComponent({
        handlers: {
          event1: vi.fn(),
          event2: vi.fn(),
          event3: vi.fn(),
        },
      });

      const handledEvents = component.getHandledEvents();
      expect(handledEvents).toHaveLength(3);
      expect(handledEvents).toContain("event1");
      expect(handledEvents).toContain("event2");
      expect(handledEvents).toContain("event3");
    });
  });

  describe("cleanup", () => {
    it("should unsubscribe from all events on destroy", () => {
      const eventBus = EventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const component = new EventHandlerComponent({
        handlers: {
          event1: handler1,
          event2: handler2,
        },
      });

      component.init(eventBus);
      component.destroy();

      eventBus.emit("event1", "data1");
      eventBus.emit("event2", "data2");
      eventBus.processEvents();

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it("should clear all handlers on destroy", () => {
      const component = new EventHandlerComponent({
        handlers: { "test:event": vi.fn() },
      });

      component.destroy();

      expect(component.getHandlers()).toEqual({});
      expect(component.getHandledEvents()).toEqual([]);
      expect(component.hasHandler("test:event")).toBe(false);
    });

    it("should not crash when destroying without EventBus connection", () => {
      const component = new EventHandlerComponent({
        handlers: { "test:event": vi.fn() },
      });

      expect(() => component.destroy()).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should create component from JSON string", () => {
      const jsonData = {
        handlers: {
          "test:event": () => console.log("test"),
        },
      };
      const jsonString = JSON.stringify(jsonData);

      const component = EventHandlerComponent.jsonToGameObject(jsonString);

      expect(component).toBeInstanceOf(EventHandlerComponent);
    });

    it("should create component from JSON object", () => {
      const jsonData = {
        handlers: {
          "test:event": vi.fn(),
        },
      };

      const component = EventHandlerComponent.jsonToGameObject(jsonData);

      expect(component).toBeInstanceOf(EventHandlerComponent);
      expect(component.hasHandler("test:event")).toBe(true);
    });

    it("should create component from empty JSON", () => {
      const component = EventHandlerComponent.jsonToGameObject({});

      expect(component).toBeInstanceOf(EventHandlerComponent);
      expect(component.getHandlers()).toEqual({});
    });
  });
});
