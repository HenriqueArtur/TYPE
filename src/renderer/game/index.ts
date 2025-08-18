import * as PIXI from "pixi.js";
import { Ticker } from "pixi.js";
import type { GameObject } from "../../__Engine__/GameObject";
import { Mouse } from "../../__Engine__/InputDevices/Mouse";
import INITIAL_SCENE from "../../__Project__";

export async function Game() {
  const app = new PIXI.Application();
  await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb });
  document.getElementById("game")?.appendChild(app.canvas as unknown as Node);

  const game_scene = INITIAL_SCENE;

  for (const sprite of game_scene.components.sprites) {
    await sprite.load();
    app.stage.addChild(sprite.instance());
  }

  const MOUSE = new Mouse();
  function onMouseMove(event: MouseEvent) {
    MOUSE.position.x = event.x;
    MOUSE.position.y = event.y;
  }
  app.canvas.addEventListener("mousemove", onMouseMove);

  const ticker = new Ticker();
  game_scene.gameObjects.forEach((gb: GameObject) => {
    ticker.add((t) => gb.update({ deltaTime: t.deltaTime, mouse: MOUSE }));
  });

  // Add scene update for collision detection
  ticker.add(() => game_scene.update());

  ticker.start();
}

Game();
