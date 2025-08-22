import type { SpriteComponent } from "../Component/Drawable/SpriteComponent";

export class RenderEngine {
  private sprites: SpriteComponent[] = [];

  addSprite(sprite: SpriteComponent): void {
    if (!this.sprites.includes(sprite)) {
      this.sprites.push(sprite);
    }
  }

  removeSprite(sprite: SpriteComponent): void {
    const index = this.sprites.indexOf(sprite);
    if (index > -1) {
      this.sprites.splice(index, 1);
    }
  }

  getSprites(): SpriteComponent[] {
    return [...this.sprites];
  }

  async loadAllSprites(): Promise<void> {
    await Promise.all(this.sprites.map((sprite) => sprite.load()));
  }

  destroy(): void {
    // Clear all sprites
    this.sprites.length = 0;
  }
}
