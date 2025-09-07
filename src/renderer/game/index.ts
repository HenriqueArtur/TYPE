import { SPRITE_COMPONENT } from "../../__Engine__/Component/Drawable/SpriteComponent";
import { TypeEngine } from "../../__Engine__/TypeEngine";

export async function Game() {
  const engine = new TypeEngine({
    projectPath: "../game",
    Render: { width: 800, height: 600 },
  });
  engine.EntityEngine.registerComponent(
    SPRITE_COMPONENT.name,
    SPRITE_COMPONENT.create as (...args: unknown[]) => unknown,
  );
  await engine.setup();
  engine.start();
}

Game();
