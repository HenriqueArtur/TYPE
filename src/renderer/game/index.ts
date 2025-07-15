import * as PIXI from "pixi.js";
import scene from "../../project/scene.json";
import {
  type Component,
  type ComponentClass,
  Entity,
  SpriteComponent,
  TransformComponent,
} from "./ecs";

const componentRegistry: Record<string, ComponentClass<Component>> = {
  TransformComponent,
  SpriteComponent,
};

const game = async () => {
  const app = new PIXI.Application();
  await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb });
  document.getElementById("game")?.appendChild(app.view as unknown as Node);

  const entities: Entity[] = [];

  for (const entityData of scene.scene.entities) {
    const entity = new Entity(entityData.name);

    for (const componentData of entityData.components) {
      const ComponentClass = componentRegistry[componentData.type];
      if (ComponentClass) {
        const component = new ComponentClass(componentData.data);
        entity.addComponent(component);
      }
    }
    entities.push(entity);
  }

  for (const entity of entities) {
    const transform = entity.getComponent(TransformComponent);
    const spriteComponent = entity.getComponent(SpriteComponent);

    if (transform && spriteComponent) {
      const texture = await PIXI.Assets.load(`../${spriteComponent.texture}`);
      const sprite = new PIXI.Sprite(texture);

      sprite.x = transform.x;
      sprite.y = transform.y;
      sprite.rotation = transform.rotation;
      sprite.scale.x = transform.scaleX;
      sprite.scale.y = transform.scaleY;

      sprite.anchor.set(0.5);

      app.stage.addChild(sprite);
    }
  }
};

game();
