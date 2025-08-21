import { GameObject, type RectangularBodyComponent, type SpriteComponent } from "../__Engine__";
import type { GameObjectUpdate } from "../__Engine__/GameObject/AbstractGameObject";
import { Angle } from "../__Engine__/Utils/Angle";

export interface BunnyData {
  sprite: SpriteComponent;
  body: RectangularBodyComponent;
}

export class Bunny extends GameObject {
  name = "Bunny1";
  sprite: SpriteComponent;
  body: RectangularBodyComponent;

  constructor({ sprite, body, ...data }: BunnyData) {
    super(data);
    this.sprite = sprite;
    this.body = body;
  }

  update({ deltaTime, mouse }: GameObjectUpdate) {
    const value = this.sprite._transform.value();

    // Update body position to follow mouse (physics world will sync sprite)
    this.body.setPosition(mouse.position.x, mouse.position.y);

    // Update rotation independently since physics doesn't control this for mouse following
    this.sprite.transform({
      rotation: Angle.fromDegrees(value.rotation.degrees + 0.1 * deltaTime),
    });
  }

  destroy() {
    console.log(`${this.name} destroyed!`);

    // Destroy components
    this.sprite.destroy();
    this.body.destroy();

    // Call parent destroy
    super.destroy();
  }
}
