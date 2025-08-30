import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEngine } from "./EventEngine";
import { RemoveEventHandler } from "./RemoveEventHandler";

describe("RemoveEventHandler", () => {
  let eventEngine: EventEngine;
  let removeEventHandler: RemoveEventHandler;

  beforeEach(() => {
    eventEngine = new EventEngine();
    removeEventHandler = new RemoveEventHandler(eventEngine);
  });

  afterEach(() => {
    removeEventHandler.destroy();
  });

  describe("constructor", () => {
    it("should create instance and set up event listeners", () => {
      expect(removeEventHandler).toBeInstanceOf(RemoveEventHandler);

      // Verify that the handler is listening for component:removed events
      expect(eventEngine.hasListeners("component:removed")).toBe(true);
      expect(eventEngine.getListenerCount("component:removed")).toBe(1);
    });
  });

  describe("handleComponentRemoved", () => {
    describe("SpriteComponent handling", () => {
      it("should emit remove:drawable when SpriteComponent is removed", () => {
        const removeDrawableListener = vi.fn();
        eventEngine.on("remove:drawable", removeDrawableListener);

        const entityId = "test-entity-123";
        const componentData = {
          texture: "player.png",
          position: { x: 100, y: 200 },
        };

        // Simulate component removal
        eventEngine.emit("component:removed", entityId, "SpriteComponent", componentData);
        eventEngine.processEvents();

        expect(removeDrawableListener).toHaveBeenCalledWith({
          entityId,
          componentName: "SpriteComponent",
          componentData,
        });
      });

      it("should handle multiple SpriteComponent removals", () => {
        const removeDrawableListener = vi.fn();
        eventEngine.on("remove:drawable", removeDrawableListener);

        const entity1 = "entity-1";
        const entity2 = "entity-2";
        const componentData1 = { texture: "sprite1.png" };
        const componentData2 = { texture: "sprite2.png" };

        // Remove multiple sprite components
        eventEngine.emit("component:removed", entity1, "SpriteComponent", componentData1);
        eventEngine.emit("component:removed", entity2, "SpriteComponent", componentData2);
        eventEngine.processEvents();

        expect(removeDrawableListener).toHaveBeenCalledTimes(2);
        expect(removeDrawableListener).toHaveBeenNthCalledWith(1, {
          entityId: entity1,
          componentName: "SpriteComponent",
          componentData: componentData1,
        });
        expect(removeDrawableListener).toHaveBeenNthCalledWith(2, {
          entityId: entity2,
          componentName: "SpriteComponent",
          componentData: componentData2,
        });
      });
    });

    describe("non-SpriteComponent handling", () => {
      it("should not emit remove:drawable for non-sprite components", () => {
        const removeDrawableListener = vi.fn();
        eventEngine.on("remove:drawable", removeDrawableListener);

        const entityId = "test-entity";
        const componentData = { x: 10, y: 20 };

        // Remove a non-sprite component
        eventEngine.emit("component:removed", entityId, "TransformComponent", componentData);
        eventEngine.processEvents();

        expect(removeDrawableListener).not.toHaveBeenCalled();
      });

      it("should handle BodyComponent removal without emitting remove:drawable", () => {
        const removeDrawableListener = vi.fn();
        eventEngine.on("remove:drawable", removeDrawableListener);

        const entityId = "physics-entity";
        const componentData = {
          mass: 10,
          velocity: { x: 5, y: -2 },
        };

        eventEngine.emit("component:removed", entityId, "BodyComponent", componentData);
        eventEngine.processEvents();

        expect(removeDrawableListener).not.toHaveBeenCalled();
      });

      it("should handle multiple different component types", () => {
        const removeDrawableListener = vi.fn();
        eventEngine.on("remove:drawable", removeDrawableListener);

        const entityId = "test-entity";

        // Remove various component types
        eventEngine.emit("component:removed", entityId, "TransformComponent", { x: 0, y: 0 });
        eventEngine.emit("component:removed", entityId, "BodyComponent", { mass: 5 });
        eventEngine.emit("component:removed", entityId, "AudioComponent", { sound: "beep.wav" });
        eventEngine.processEvents();

        // Only sprite components should trigger remove:drawable
        expect(removeDrawableListener).not.toHaveBeenCalled();
      });
    });

    describe("mixed component handling", () => {
      it("should only emit remove:drawable for SpriteComponents in mixed removal batch", () => {
        const removeDrawableListener = vi.fn();
        eventEngine.on("remove:drawable", removeDrawableListener);

        const entityId = "mixed-entity";

        // Remove mixed component types
        eventEngine.emit("component:removed", entityId, "TransformComponent", { x: 10, y: 10 });
        eventEngine.emit("component:removed", entityId, "SpriteComponent", { texture: "test.png" });
        eventEngine.emit("component:removed", entityId, "BodyComponent", { mass: 1 });
        eventEngine.emit("component:removed", entityId, "SpriteComponent", {
          texture: "test2.png",
        });
        eventEngine.processEvents();

        expect(removeDrawableListener).toHaveBeenCalledTimes(2);
        expect(removeDrawableListener).toHaveBeenNthCalledWith(1, {
          entityId,
          componentName: "SpriteComponent",
          componentData: { texture: "test.png" },
        });
        expect(removeDrawableListener).toHaveBeenNthCalledWith(2, {
          entityId,
          componentName: "SpriteComponent",
          componentData: { texture: "test2.png" },
        });
      });
    });
  });

  describe("destroy", () => {
    it("should remove event listeners when destroyed", () => {
      expect(eventEngine.hasListeners("component:removed")).toBe(true);

      removeEventHandler.destroy();

      expect(eventEngine.hasListeners("component:removed")).toBe(false);
      expect(eventEngine.getListenerCount("component:removed")).toBe(0);
    });

    it("should not emit events after destruction", () => {
      const removeDrawableListener = vi.fn();
      eventEngine.on("remove:drawable", removeDrawableListener);

      removeEventHandler.destroy();

      // Try to trigger component removal after destruction
      eventEngine.emit("component:removed", "entity", "SpriteComponent", { texture: "test.png" });
      eventEngine.processEvents();

      expect(removeDrawableListener).not.toHaveBeenCalled();
    });

    it("should be safe to call destroy multiple times", () => {
      expect(() => {
        removeEventHandler.destroy();
        removeEventHandler.destroy();
        removeEventHandler.destroy();
      }).not.toThrow();
    });
  });

  describe("integration", () => {
    it("should work with real EventEngine event flow", () => {
      const removeDrawableListener = vi.fn();
      const componentRemovedListener = vi.fn();

      eventEngine.on("remove:drawable", removeDrawableListener);
      eventEngine.on("component:removed", componentRemovedListener);

      const entityId = "integration-entity";
      const spriteData = {
        texture: "integration-test.png",
        scale: { x: 2, y: 2 },
        rotation: 45,
      };

      // Simulate the full flow
      eventEngine.emit("component:removed", entityId, "SpriteComponent", spriteData);
      eventEngine.processEvents();

      // Both the original component:removed and the derived remove:drawable should be called
      expect(componentRemovedListener).toHaveBeenCalledWith(
        entityId,
        "SpriteComponent",
        spriteData,
      );
      expect(removeDrawableListener).toHaveBeenCalledWith({
        entityId,
        componentName: "SpriteComponent",
        componentData: spriteData,
      });
    });

    it("should handle event processing order correctly", () => {
      const callOrder: string[] = [];

      eventEngine.on("component:removed", () => {
        callOrder.push("component:removed");
      });

      eventEngine.on("remove:drawable", () => {
        callOrder.push("remove:drawable");
      });

      eventEngine.emit("component:removed", "entity", "SpriteComponent", { texture: "test.png" });
      eventEngine.processEvents();

      expect(callOrder).toEqual(["component:removed", "remove:drawable"]);
    });
  });

  describe("error handling", () => {
    it("should handle invalid component data gracefully", () => {
      const removeDrawableListener = vi.fn();
      eventEngine.on("remove:drawable", removeDrawableListener);

      expect(() => {
        eventEngine.emit("component:removed", "entity", "SpriteComponent", null);
        eventEngine.processEvents();
      }).not.toThrow();

      expect(removeDrawableListener).toHaveBeenCalledWith({
        entityId: "entity",
        componentName: "SpriteComponent",
        componentData: null,
      });
    });

    it("should handle undefined component data", () => {
      const removeDrawableListener = vi.fn();
      eventEngine.on("remove:drawable", removeDrawableListener);

      expect(() => {
        eventEngine.emit("component:removed", "entity", "SpriteComponent", undefined);
        eventEngine.processEvents();
      }).not.toThrow();

      expect(removeDrawableListener).toHaveBeenCalledWith({
        entityId: "entity",
        componentName: "SpriteComponent",
        componentData: undefined,
      });
    });
  });
});
