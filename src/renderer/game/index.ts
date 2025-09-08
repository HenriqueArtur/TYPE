import { TypeEngine } from "../../__Engine__/TypeEngine";

export async function Game() {
  const engine = new TypeEngine({
    projectPath: "../game",
    Render: { width: 800, height: 600 },
  });
  await engine.setup();
  engine.start();
}

Game();
