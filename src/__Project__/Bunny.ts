import { GameObject, SpriteComponent } from "../__Engine__";
import type { GameObjectUpdate } from "../__Engine__/GameObject/AbstractGameObject";
import { Angle } from "../__Engine__/Utils/Angle";

export interface BunnyData {
  sprite: SpriteComponent;
}

export class Bunny extends GameObject {
  name = "name";
  sprite: SpriteComponent;

  constructor({ sprite, ...data }: BunnyData) {
    super(data);
    this.sprite = sprite;
  }

  update({deltaTime}: GameObjectUpdate) {
    const value = this.sprite._transform.value();
    this.sprite.transform({ rotation: Angle.fromDegrees(value.rotation.degrees + 0.1 * deltaTime) });
  }
}
