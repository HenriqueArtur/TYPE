import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DrawableComponent } from "../Component/DrawableComponent";
import { RenderEngine } from "./RenderEngine";

describe("RenderEngine", () => {
  let renderEngine: RenderEngine;

  beforeEach(() => {
    renderEngine = new RenderEngine();
  });

  describe("drawable management", () => {
    it("should start with no drawables", () => {
      expect(renderEngine.getDrawables()).toHaveLength(0);
    });

    it("should add drawable to the render list", () => {
      const mockDrawable = createMockDrawable();

      renderEngine.addDrawable(mockDrawable);

      expect(renderEngine.getDrawables()).toContain(mockDrawable);
      expect(renderEngine.getDrawables()).toHaveLength(1);
    });

    it("should remove drawable from the render list", () => {
      const mockDrawable = createMockDrawable();
      renderEngine.addDrawable(mockDrawable);

      renderEngine.removeDrawable(mockDrawable);

      expect(renderEngine.getDrawables()).not.toContain(mockDrawable);
      expect(renderEngine.getDrawables()).toHaveLength(0);
    });

    it("should handle removing non-existent drawable", () => {
      const mockDrawable = createMockDrawable();

      expect(() => renderEngine.removeDrawable(mockDrawable)).not.toThrow();
    });

    it("should not add duplicate drawables", () => {
      const mockDrawable = createMockDrawable();

      renderEngine.addDrawable(mockDrawable);
      renderEngine.addDrawable(mockDrawable);

      expect(renderEngine.getDrawables()).toHaveLength(1);
    });

    it("should load all drawables with load method", async () => {
      const mockDrawable1 = createMockDrawable(true);
      const mockDrawable2 = createMockDrawable(true);
      const mockDrawable3 = createMockDrawable(false); // No load method

      renderEngine.addDrawable(mockDrawable1);
      renderEngine.addDrawable(mockDrawable2);
      renderEngine.addDrawable(mockDrawable3);

      await renderEngine.loadAllDrawables();

      expect((mockDrawable1 as unknown as { load: () => Promise<void> }).load).toHaveBeenCalled();
      expect((mockDrawable2 as unknown as { load: () => Promise<void> }).load).toHaveBeenCalled();
    });

    it("should filter visible drawables", () => {
      const visibleDrawable = createMockDrawable(false, true);
      const hiddenDrawable = createMockDrawable(false, false);

      renderEngine.addDrawable(visibleDrawable);
      renderEngine.addDrawable(hiddenDrawable);

      const visibleDrawables = renderEngine.getVisibleDrawables();

      expect(visibleDrawables).toContain(visibleDrawable);
      expect(visibleDrawables).not.toContain(hiddenDrawable);
      expect(visibleDrawables).toHaveLength(1);
    });

    it("should update all drawables visuals", () => {
      const mockDrawable1 = createMockDrawable();
      const mockDrawable2 = createMockDrawable();
      const updateData = { alpha: 0.5, tint: 0xff0000 };

      renderEngine.addDrawable(mockDrawable1);
      renderEngine.addDrawable(mockDrawable2);

      renderEngine.updateVisuals(updateData);

      expect(mockDrawable1.updateVisual).toHaveBeenCalledWith(updateData);
      expect(mockDrawable2.updateVisual).toHaveBeenCalledWith(updateData);
    });

    it("should set all drawables visibility", () => {
      const mockDrawable1 = createMockDrawable();
      const mockDrawable2 = createMockDrawable();

      renderEngine.addDrawable(mockDrawable1);
      renderEngine.addDrawable(mockDrawable2);

      renderEngine.setAllVisible(false);

      expect(mockDrawable1.setVisible).toHaveBeenCalledWith(false);
      expect(mockDrawable2.setVisible).toHaveBeenCalledWith(false);
    });

    it("should handle loading when no drawables are present", async () => {
      expect(async () => await renderEngine.loadAllDrawables()).not.toThrow();
    });
  });

  describe("legacy sprite methods", () => {
    it("should support legacy addSprite method", () => {
      const mockDrawable = createMockDrawable();

      renderEngine.addSprite(mockDrawable);

      expect(renderEngine.getSprites()).toContain(mockDrawable);
    });

    it("should support legacy loadAllSprites method", async () => {
      const mockDrawable = createMockDrawable(true);
      renderEngine.addSprite(mockDrawable);

      await renderEngine.loadAllSprites();

      expect((mockDrawable as unknown as { load: () => Promise<void> }).load).toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should clear all drawables on destroy", () => {
      const mockDrawable1 = createMockDrawable();
      const mockDrawable2 = createMockDrawable();

      renderEngine.addDrawable(mockDrawable1);
      renderEngine.addDrawable(mockDrawable2);

      renderEngine.destroy();

      expect(renderEngine.getDrawables()).toHaveLength(0);
    });

    it("should handle destroy when already empty", () => {
      expect(() => renderEngine.destroy()).not.toThrow();
    });
  });
});

function createMockDrawable(hasLoad = false, isVisible = true): DrawableComponent {
  const mockDrawable = {
    type: "MockDrawable",
    getDrawable: vi.fn().mockReturnValue({}),
    updateVisual: vi.fn(),
    isVisible: vi.fn().mockReturnValue(isVisible),
    setVisible: vi.fn(),
    getDimensions: vi.fn().mockReturnValue({ width: 100, height: 100 }),
    destroy: vi.fn(),
  } as unknown as DrawableComponent;

  if (hasLoad) {
    (mockDrawable as unknown as { load: () => Promise<void> }).load = vi
      .fn()
      .mockResolvedValue(undefined);
  }

  return mockDrawable;
}
