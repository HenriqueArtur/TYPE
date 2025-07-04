import * as PIXI from "pixi.js";
import scene from "../../scene.json";

const game = async () => {
  const app = new PIXI.Application();
  await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb });
  document.getElementById("game")?.appendChild(app.view as unknown as Node);

  const bunnyObject = scene.scene.objects.find((obj) => obj.name === "bunny");

  if (bunnyObject) {
    const texture = await PIXI.Assets.load(bunnyObject.sprite);
    const bunny = new PIXI.Sprite(texture);

    bunny.x = bunnyObject.position.x;
    bunny.y = bunnyObject.position.y;

    bunny.anchor.set(0.5);

    app.stage.addChild(bunny);

    if (bunnyObject.behaviors.some((b) => b.type === "followMouse")) {
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;
      app.stage.on("pointermove", (event) => {
        bunny.position.copyFrom(event.global);
      });
    }
  }
};

game();
