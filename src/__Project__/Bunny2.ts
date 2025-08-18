import { GameObject, type RectangularBodyComponent, type SpriteComponent } from "../__Engine__";
import type { GameObjectUpdate } from "../__Engine__/GameObject/AbstractGameObject";

export interface Bunny2Data {
  sprite: SpriteComponent;
  body: RectangularBodyComponent;
}

export class Bunny2 extends GameObject {
  name = "Bunny2";
  sprite: SpriteComponent;
  body: RectangularBodyComponent;

  constructor({ sprite, body, ...data }: Bunny2Data) {
    super(data);
    this.sprite = sprite;
    this.body = body;
  }

  update(_update: GameObjectUpdate) {
    // Bunny2 stays at fixed position, no movement logic needed
    // Just keeping the update method in case we want to add animations later
  }

  destroy() {
    // Method to handle bunny destruction
    console.log(`${this.name} destroyed!`);

    // Remove sprite from PIXI stage
    if (this.sprite) {
      const spriteInstance = this.sprite.instance();
      if (spriteInstance.parent) {
        spriteInstance.parent.removeChild(spriteInstance);
      }
    }

    // Additional cleanup logic can be added here
  }
}
