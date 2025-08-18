import type { GameObject, RectangularBodyComponent, SpriteComponent } from "../__Engine__";
import type { ComponentLoaded } from "../__Engine__/GameObject/InjectDependencies";
import { GameScene } from "../__Engine__/Scene";
import BUNNY_LOADED from "./Bunny.loaded";
import BUNNY2_LOADED from "./Bunny2.loaded";

const GAME_OBJECTS_LOADED: ComponentLoaded[] = [BUNNY_LOADED, BUNNY2_LOADED];

const gameObjects: GameObject[] = [];
const sprites: SpriteComponent[] = [];
const bodies: RectangularBodyComponent[] = [];

for (const { instance, sprites: s, bodies: b } of GAME_OBJECTS_LOADED) {
  gameObjects.push(instance);
  sprites.push(...s);
  bodies.push(...b);
}

const INITIAL_SCENE = new GameScene({
  name: "Initial Scene",
  gameObjects,
  components: {
    sprites,
    bodies,
  },
});

export default INITIAL_SCENE;
