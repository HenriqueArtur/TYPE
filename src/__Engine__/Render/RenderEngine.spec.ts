import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SpriteComponent } from "../Component/Drawable/SpriteComponent";
import { RenderEngine } from "./RenderEngine";

describe("RenderEngine", () => {
  let renderEngine: RenderEngine;

  beforeEach(() => {
    renderEngine = new RenderEngine();
  });

  describe("sprite management", () => {
    it("should start with no sprites", () => {
      expect(renderEngine.getSprites()).toHaveLength(0);
    });

    it("should add sprite to the render list", () => {
      const mockSprite = createMockSprite();

      renderEngine.addSprite(mockSprite);

      expect(renderEngine.getSprites()).toContain(mockSprite);
      expect(renderEngine.getSprites()).toHaveLength(1);
    });

    it("should remove sprite from the render list", () => {
      const mockSprite = createMockSprite();
      renderEngine.addSprite(mockSprite);

      renderEngine.removeSprite(mockSprite);

      expect(renderEngine.getSprites()).not.toContain(mockSprite);
      expect(renderEngine.getSprites()).toHaveLength(0);
    });

    it("should handle removing non-existent sprite", () => {
      const mockSprite = createMockSprite();

      expect(() => renderEngine.removeSprite(mockSprite)).not.toThrow();
    });

    it("should not add duplicate sprites", () => {
      const mockSprite = createMockSprite();

      renderEngine.addSprite(mockSprite);
      renderEngine.addSprite(mockSprite);

      expect(renderEngine.getSprites()).toHaveLength(1);
    });

    it("should load all sprites", async () => {
      const mockSprite1 = createMockSprite();
      const mockSprite2 = createMockSprite();

      renderEngine.addSprite(mockSprite1);
      renderEngine.addSprite(mockSprite2);

      await renderEngine.loadAllSprites();

      expect(mockSprite1.load).toHaveBeenCalled();
      expect(mockSprite2.load).toHaveBeenCalled();
    });

    it("should handle loading when no sprites are present", async () => {
      expect(async () => await renderEngine.loadAllSprites()).not.toThrow();
    });
  });

  describe("cleanup", () => {
    it("should clear all sprites on destroy", () => {
      const mockSprite1 = createMockSprite();
      const mockSprite2 = createMockSprite();

      renderEngine.addSprite(mockSprite1);
      renderEngine.addSprite(mockSprite2);

      renderEngine.destroy();

      expect(renderEngine.getSprites()).toHaveLength(0);
    });

    it("should handle destroy when already empty", () => {
      expect(() => renderEngine.destroy()).not.toThrow();
    });
  });
});

function createMockSprite(): SpriteComponent {
  return {
    transform: vi.fn(),
    load: vi.fn().mockResolvedValue(undefined),
    instance: vi.fn(),
  } as unknown as SpriteComponent;
}
