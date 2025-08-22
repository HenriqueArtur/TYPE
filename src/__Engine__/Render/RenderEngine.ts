import type { DrawableComponent } from "../Component/DrawableComponent";

export class RenderEngine {
  private drawables: DrawableComponent[] = [];

  addDrawable(drawable: DrawableComponent): void {
    if (!this.drawables.includes(drawable)) {
      this.drawables.push(drawable);
    }
  }

  removeDrawable(drawable: DrawableComponent): void {
    const index = this.drawables.indexOf(drawable);
    if (index > -1) {
      this.drawables.splice(index, 1);
    }
  }

  getDrawables(): DrawableComponent[] {
    return [...this.drawables];
  }

  getVisibleDrawables(): DrawableComponent[] {
    return this.drawables.filter((drawable) => drawable.isVisible());
  }

  async loadAllDrawables(): Promise<void> {
    // Load drawable components that have a load method (like SpriteComponent)
    const loadPromises = this.drawables
      .filter((drawable) => "load" in drawable && typeof drawable.load === "function")
      .map((drawable) => (drawable as unknown as { load: () => Promise<void> }).load());

    await Promise.all(loadPromises);
  }

  updateVisuals(data: Record<string, unknown>): void {
    this.drawables.forEach((drawable) => {
      drawable.updateVisual(data);
    });
  }

  setAllVisible(visible: boolean): void {
    this.drawables.forEach((drawable) => {
      drawable.setVisible(visible);
    });
  }

  destroy(): void {
    // Clear all drawables
    this.drawables.length = 0;
  }

  // Legacy methods for backward compatibility
  addSprite(sprite: DrawableComponent): void {
    this.addDrawable(sprite);
  }

  removeSprite(sprite: DrawableComponent): void {
    this.removeDrawable(sprite);
  }

  getSprites(): DrawableComponent[] {
    return this.getDrawables();
  }

  async loadAllSprites(): Promise<void> {
    return this.loadAllDrawables();
  }
}
