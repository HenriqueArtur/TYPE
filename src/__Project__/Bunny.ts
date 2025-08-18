import { Body as MatterBody } from "matter-js";
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

    // Update sprite position to follow mouse
    this.sprite.transform({
      position: {
        x: mouse.position.x,
        y: mouse.position.y,
      },
      rotation: Angle.fromDegrees(value.rotation.degrees + 0.1 * deltaTime),
    });

    // Update body position to match sprite
    MatterBody.setPosition(this.body.getBody(), {
      x: mouse.position.x,
      y: mouse.position.y,
    });
  }

  destroy() {
    // Method to handle bunny destruction
    console.log(`${this.name} destroyed!`);
    // Additional cleanup logic can be added here
  }
}
