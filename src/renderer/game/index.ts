import * as PIXI from "pixi.js";
import { Ticker } from "pixi.js";
import scene from "../../project/scene.json";
import type { GameObject } from "./GameObject";
import { GameScene } from "./Scene";

const game_scene = GameScene.load(scene);

export async function Game() {
  const app = new PIXI.Application();
  await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb });
  document.getElementById("game")?.appendChild(app.canvas as unknown as Node);

  for (const sprite of game_scene.components.sprites) {
    await sprite.load();

    app.stage.addChild(sprite.instance());
  }

  const ticker = new Ticker();
  game_scene.gameObjects.forEach((gb: GameObject) => {
    ticker.add((_t) => gb.update());
  });
  ticker.start();
}

Game();
