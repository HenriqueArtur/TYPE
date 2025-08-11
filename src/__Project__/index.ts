import type { GameObject, SpriteComponent } from "../__Engine__";
import type { ComponentLoaded } from "../__Engine__/GameObject/InjectDependencies";
import { GameScene } from "../__Engine__/Scene";
import BUNNY_LOADED from "./Bunny.loaded";

const GAME_OBJECTS_LOADED: ComponentLoaded[] = [BUNNY_LOADED];

const gameObjects: GameObject[] = [];
const sprites: SpriteComponent[] = [];

for (const { instance, sprites: s } of GAME_OBJECTS_LOADED) {
  gameObjects.push(instance);
  sprites.push(...s);
}

const INITIAL_SCENE = new GameScene({
  name: "Initial Scene",
  gameObjects,
  components: {
    sprites,
  },
});

export default INITIAL_SCENE;
