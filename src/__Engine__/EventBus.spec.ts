import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "./EventBus";

describe("EventBus", () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  describe("singleton pattern", () => {
    it("should return the same instance when getInstance is called multiple times", () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create a new instance after reset", () => {
      const instance1 = EventBus.getInstance();
      EventBus.resetInstance();
      const instance2 = EventBus.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe("event subscription and emission", () => {
    it("should queue events by default (not emit immediately)", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("test:event", listener);
      eventBus.emit("test:event", "arg1", "arg2");

      // Should not be called immediately
      expect(listener).not.toHaveBeenCalled();

      // Should be called after processing events
      eventBus.processEvents();
      expect(listener).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should emit immediate events to subscribed listeners", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("test:event", listener);
      eventBus.emitImmediate("test:event", "arg1", "arg2");

      expect(listener).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should support multiple listeners for immediate events", () => {
      const eventBus = EventBus.getInstance();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on("test:event", listener1);
      eventBus.on("test:event", listener2);
      eventBus.emitImmediate("test:event", "data");

      expect(listener1).toHaveBeenCalledWith("data");
      expect(listener2).toHaveBeenCalledWith("data");
    });

    it("should not call listeners for different events", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("event1", listener);
      eventBus.emitImmediate("event2", "data");

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("event unsubscription", () => {
    it("should unsubscribe using returned function", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      const unsubscribe = eventBus.on("test:event", listener);
      unsubscribe();
      eventBus.emit("test:event", "data");
      eventBus.processEvents();

      expect(listener).not.toHaveBeenCalled();
    });

    it("should unsubscribe using off method", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("test:event", listener);
      eventBus.off("test:event", listener);
      eventBus.emit("test:event", "data");
      eventBus.processEvents();

      expect(listener).not.toHaveBeenCalled();
    });

    it("should remove all listeners for an event", () => {
      const eventBus = EventBus.getInstance();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on("test:event", listener1);
      eventBus.on("test:event", listener2);
      eventBus.removeAllListeners("test:event");
      eventBus.emit("test:event", "data");

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("once subscription", () => {
    it("should only trigger listener once", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.once("test:event", listener);
      eventBus.emit("test:event", "data1");
      eventBus.emit("test:event", "data2");
      eventBus.processEvents();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("data1");
    });

    it("should return unsubscribe function", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      const unsubscribe = eventBus.once("test:event", listener);
      unsubscribe();
      eventBus.emit("test:event", "data");

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("event queuing", () => {
    it("should queue events and process them later", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("test:event", listener);
      eventBus.emit("test:event", "queued-data");

      expect(listener).not.toHaveBeenCalled();

      eventBus.processEvents();

      expect(listener).toHaveBeenCalledWith("queued-data");
    });

    it("should process multiple queued events in order", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();
      const callOrder: string[] = [];

      eventBus.on("test:event", (data: string) => {
        callOrder.push(data);
        listener(data);
      });

      eventBus.emit("test:event", "first");
      eventBus.emit("test:event", "second");
      eventBus.processEvents();

      expect(listener).toHaveBeenCalledTimes(2);
      expect(callOrder).toEqual(["first", "second"]);
    });

    it("should clear queue after processing", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("test:event", listener);
      eventBus.emit("test:event", "data");
      eventBus.processEvents();
      eventBus.processEvents(); // Second call should not trigger listener again

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("utility methods", () => {
    it("should get listener count", () => {
      const eventBus = EventBus.getInstance();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      expect(eventBus.getListenerCount("test:event")).toBe(0);

      eventBus.on("test:event", listener1);
      expect(eventBus.getListenerCount("test:event")).toBe(1);

      eventBus.on("test:event", listener2);
      expect(eventBus.getListenerCount("test:event")).toBe(2);
    });

    it("should check if event has listeners", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      expect(eventBus.hasListeners("test:event")).toBe(false);

      eventBus.on("test:event", listener);
      expect(eventBus.hasListeners("test:event")).toBe(true);

      eventBus.off("test:event", listener);
      expect(eventBus.hasListeners("test:event")).toBe(false);
    });

    it("should get registered event names", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("event1", listener);
      eventBus.on("event2", listener);

      const registeredEvents = eventBus.getRegisteredEvents();
      expect(registeredEvents).toContain("event1");
      expect(registeredEvents).toContain("event2");
      expect(registeredEvents).toHaveLength(2);
    });

    it("should clear all listeners and queued events", () => {
      const eventBus = EventBus.getInstance();
      const listener = vi.fn();

      eventBus.on("event1", listener);
      eventBus.on("event2", listener);

      eventBus.clear();

      expect(eventBus.getRegisteredEvents()).toHaveLength(0);
      eventBus.processEvents();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle listener errors without stopping other listeners", () => {
      const eventBus = EventBus.getInstance();
      const errorListener = vi.fn(() => {
        throw new Error("Test error");
      });
      const normalListener = vi.fn();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      eventBus.on("test:event", errorListener);
      eventBus.on("test:event", normalListener);

      eventBus.emit("test:event", "data");
      eventBus.processEvents();

      expect(errorListener).toHaveBeenCalledWith("data");
      expect(normalListener).toHaveBeenCalledWith("data");
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for "test:event":',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});
