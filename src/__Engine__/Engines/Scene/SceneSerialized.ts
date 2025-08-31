import type { RelativePathInProject } from "../../Utils/Types";
import type {
  GameObjectSerialized,
  GroupGameObjectSerialized,
} from "../Entity/GameObjectSerialized";

export interface SceneSerialized {
  name: string;
  path: RelativePathInProject;
  gameObjects: (GameObjectSerialized | GroupGameObjectSerialized)[];
}
