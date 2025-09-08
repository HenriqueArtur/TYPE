import type { RelativePathInProject } from "../../Utils/Types";
import type { GameObjectSerialized, GroupGameObjectSerialized } from "../Entity/__types__";

export type SceneName = string;

export interface SceneManageSerialized {
  initialScene: SceneName;
  scenes: Record<SceneName, RelativePathInProject>;
}

export interface SceneSerialized {
  name: string;
  path: RelativePathInProject;
  systems: string[];
  gameObjects: (GameObjectSerialized | GroupGameObjectSerialized)[];
}
