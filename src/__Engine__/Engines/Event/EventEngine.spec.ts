import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventEngine } from "./EventEngine";

describe("EventEngine", () => {
  let eventEngine: EventEngine;

  beforeEach(() => {
    eventEngine = new EventEngine();
  });

  describe("constructor", () => {
    it("should create instance with empty listeners and event queue", () => {
      expect(eventEngine).toBeInstanceOf(EventEngine);
      expect(eventEngine.getRegisteredEvents()).toEqual([]);
      expect(eventEngine.getListenerCount("test-event")).toBe(0);
    });
  });

  describe("event subscription", () => {
    it("should add listener and return unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = eventEngine.on("test-event", listener);

      expect(typeof unsubscribe).toBe("function");
      expect(eventEngine.hasListeners("test-event")).toBe(true);
      expect(eventEngine.getListenerCount("test-event")).toBe(1);
    });

    it("should handle multiple listeners for same event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventEngine.on("test-event", listener1);
      eventEngine.on("test-event", listener2);

      expect(eventEngine.getListenerCount("test-event")).toBe(2);
    });

    it("should unsubscribe listener when calling returned function", () => {
      const listener = vi.fn();
      const unsubscribe = eventEngine.on("test-event", listener);

      unsubscribe();

      expect(eventEngine.hasListeners("test-event")).toBe(false);
      expect(eventEngine.getListenerCount("test-event")).toBe(0);
    });

    it("should clean up event name when last listener is removed", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsubscribe1 = eventEngine.on("test-event", listener1);
      const unsubscribe2 = eventEngine.on("test-event", listener2);

      unsubscribe1();
      expect(eventEngine.getRegisteredEvents()).toContain("test-event");

      unsubscribe2();
      expect(eventEngine.getRegisteredEvents()).not.toContain("test-event");
    });

    it("should handle once() subscription that auto-unsubscribes", () => {
      const listener = vi.fn();
      eventEngine.once("test-event", listener);

      expect(eventEngine.hasListeners("test-event")).toBe(true);

      eventEngine.emitImmediate("test-event", "data");
      expect(listener).toHaveBeenCalledWith("data");
      expect(listener).toHaveBeenCalledTimes(1);

      // Should be automatically unsubscribed
      expect(eventEngine.hasListeners("test-event")).toBe(false);
    });

    it("should allow manual unsubscription with off()", () => {
      const listener = vi.fn();
      eventEngine.on("test-event", listener);

      expect(eventEngine.hasListeners("test-event")).toBe(true);

      eventEngine.off("test-event", listener);
      expect(eventEngine.hasListeners("test-event")).toBe(false);
    });

    it("should handle off() for non-existent listener gracefully", () => {
      const listener = vi.fn();
      expect(() => {
        eventEngine.off("non-existent", listener);
      }).not.toThrow();
    });
  });

  describe("event emission", () => {
    it("should emit event immediately with emitImmediate()", () => {
      const listener = vi.fn();
      eventEngine.on("test-event", listener);

      eventEngine.emitImmediate("test-event", "arg1", "arg2");

      expect(listener).toHaveBeenCalledWith("arg1", "arg2");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should handle emitImmediate() for event with no listeners", () => {
      expect(() => {
        eventEngine.emitImmediate("non-existent", "data");
      }).not.toThrow();
    });

    it("should queue events with emit() for later processing", () => {
      const listener = vi.fn();
      eventEngine.on("test-event", listener);

      eventEngine.emit("test-event", "data");

      // Should not be called immediately
      expect(listener).not.toHaveBeenCalled();

      eventEngine.processEvents();

      // Should be called after processing
      expect(listener).toHaveBeenCalledWith("data");
    });

    it("should process multiple queued events in order", () => {
      const listener = vi.fn();
      const results: string[] = [];

      eventEngine.on("test-event", (data: string) => {
        results.push(data);
        listener(data);
      });

      eventEngine.emit("test-event", "first");
      eventEngine.emit("test-event", "second");
      eventEngine.emit("test-event", "third");

      eventEngine.processEvents();

      expect(results).toEqual(["first", "second", "third"]);
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it("should clear event queue after processing", () => {
      const listener = vi.fn();
      eventEngine.on("test-event", listener);

      eventEngine.emit("test-event", "data");
      eventEngine.processEvents();
      eventEngine.processEvents(); // Process again

      // Should only be called once
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should handle listener errors gracefully in emitImmediate()", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Test error");
      });
      const normalListener = vi.fn();

      eventEngine.on("test-event", errorListener);
      eventEngine.on("test-event", normalListener);

      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        eventEngine.emitImmediate("test-event", "data");
      }).not.toThrow();

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for "test-event":',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("utility methods", () => {
    beforeEach(() => {
      eventEngine.on("event1", vi.fn());
      eventEngine.on("event1", vi.fn());
      eventEngine.on("event2", vi.fn());
    });

    it("should return correct listener count", () => {
      expect(eventEngine.getListenerCount("event1")).toBe(2);
      expect(eventEngine.getListenerCount("event2")).toBe(1);
      expect(eventEngine.getListenerCount("non-existent")).toBe(0);
    });

    it("should return all registered event names", () => {
      const events = eventEngine.getRegisteredEvents();
      expect(events).toContain("event1");
      expect(events).toContain("event2");
      expect(events).toHaveLength(2);
    });

    it("should correctly report if event has listeners", () => {
      expect(eventEngine.hasListeners("event1")).toBe(true);
      expect(eventEngine.hasListeners("event2")).toBe(true);
      expect(eventEngine.hasListeners("non-existent")).toBe(false);
    });

    it("should remove all listeners for specific event", () => {
      eventEngine.removeAllListeners("event1");

      expect(eventEngine.hasListeners("event1")).toBe(false);
      expect(eventEngine.hasListeners("event2")).toBe(true);
      expect(eventEngine.getRegisteredEvents()).not.toContain("event1");
    });

    it("should clear all listeners and queued events", () => {
      eventEngine.emit("event1", "data");
      eventEngine.emit("event2", "data");

      eventEngine.clear();

      expect(eventEngine.getRegisteredEvents()).toEqual([]);
      expect(eventEngine.hasListeners("event1")).toBe(false);
      expect(eventEngine.hasListeners("event2")).toBe(false);

      // Queued events should be cleared too
      const listener = vi.fn();
      eventEngine.on("event1", listener);
      eventEngine.processEvents();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("type safety", () => {
    it("should handle typed event callbacks correctly", () => {
      interface TestEventData {
        id: number;
        name: string;
      }

      const listener = vi.fn<(data: TestEventData) => void>();
      eventEngine.on("typed-event", listener);

      const eventData: TestEventData = { id: 1, name: "test" };
      eventEngine.emitImmediate("typed-event", eventData);

      expect(listener).toHaveBeenCalledWith(eventData);
    });

    it("should handle multiple argument types", () => {
      const listener = vi.fn<(arg1: string, arg2: number, arg3: boolean) => void>();
      eventEngine.on("multi-arg-event", listener);

      eventEngine.emitImmediate("multi-arg-event", "hello", 42, true);

      expect(listener).toHaveBeenCalledWith("hello", 42, true);
    });
  });

  describe("edge cases", () => {
    it("should handle concurrent listener modifications during emission", () => {
      const listeners: Array<() => void> = [];
      let callCount = 0;

      const createListener = (id: number) => () => {
        callCount++;
        if (id === 1) {
          // Remove listener during emission
          eventEngine.off("test-event", listeners[2]);
        }
      };

      for (let i = 0; i < 3; i++) {
        const listener = createListener(i);
        listeners.push(listener);
        eventEngine.on("test-event", listener);
      }

      eventEngine.emitImmediate("test-event");

      // Should handle modification gracefully
      expect(callCount).toBe(3); // All listeners should still be called
    });

    it("should handle recursive event emissions", () => {
      const results: string[] = [];

      eventEngine.on("recursive-event", (data: string) => {
        results.push(data);
        if (data === "start") {
          eventEngine.emitImmediate("recursive-event", "nested");
        }
      });

      eventEngine.emitImmediate("recursive-event", "start");

      expect(results).toEqual(["start", "nested"]);
    });
  });
});
