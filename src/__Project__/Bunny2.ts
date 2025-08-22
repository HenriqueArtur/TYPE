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
    // Sync sprite position with physics body
    const body = this.body.getBody();
    this.sprite.transform({
      position: {
        x: body.position.x,
        y: body.position.y,
      },
      rotation: this.sprite._transform.value().rotation,
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
