import * as PIXI from "pixi.js";
import { Mouse } from "../../__Engine__/InputDevices/Mouse";
import { TypeEngine } from "../../__Engine__/TypeEngine";
import INITIAL_SCENE from "../../__Project__";

export async function Game() {
  const app = new PIXI.Application();
  await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb });
  document.getElementById("game")?.appendChild(app.canvas as unknown as Node);

  // Initialize TypeEngine and load the scene
  const engine = TypeEngine.getInstance();
  engine.loadScene(INITIAL_SCENE);

  const currentScene = engine.getCurrentScene();
  if (!currentScene) {
    throw new Error("Failed to load initial scene");
  }

  // Load and add sprites from RenderEngine
  const renderEngine = engine.getRenderEngine();
  await renderEngine.loadAllSprites();

  for (const sprite of renderEngine.getSprites()) {
    app.stage.addChild(sprite.instance());
  }

  const MOUSE = new Mouse();
  function onMouseMove(event: MouseEvent) {
    MOUSE.position.x = event.x;
    MOUSE.position.y = event.y;
  }
  app.canvas.addEventListener("mousemove", onMouseMove);

  // Start the game loop using TypeEngine
  engine.startGameLoop(undefined, MOUSE);
}

Game();
