import { SpriteComponent, type SpriteComponentData } from "../../__Engine__/Component/Drawable";
import { RenderPixiSystem } from "../../__Engine__/Systems";
import { TypeEngine } from "../../__Engine__/TypeEngine";

export async function Game() {
  const engine = new TypeEngine({
    projectPath: "../renderer",
    Render: { width: 800, height: 600 },
    systemsList: [],
  });
  engine.EntityEngine.registerComponent(
    "SpriteComponent",
    <T = SpriteComponentData>(data: T) => new SpriteComponent(data as SpriteComponentData),
  );
  engine.addSystem(new RenderPixiSystem());
  await engine.setup();
  engine.start();
}

Game();
