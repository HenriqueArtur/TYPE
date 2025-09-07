import { SpriteComponent, type SpriteComponentData } from "../../__Engine__/Component/Drawable";
import { TypeEngine } from "../../__Engine__/TypeEngine";

export async function Game() {
  const engine = new TypeEngine({
    projectPath: "../game",
    Render: { width: 800, height: 600 },
  });
  engine.EntityEngine.registerComponent(
    "SpriteComponent",
    <T = SpriteComponentData>(data: T) => new SpriteComponent(data as SpriteComponentData),
  );
  await engine.setup();
  engine.start();
}

Game();
