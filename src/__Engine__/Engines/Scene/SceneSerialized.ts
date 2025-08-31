import type { SystemName } from "../../Systems/System";
import type { RelativePathInProject } from "../../Utils/Types";
import type {
  GameObjectSerialized,
  GroupGameObjectSerialized,
} from "../Entity/GameObjectSerialized";

export interface SceneSerialized {
  name: string;
  path: RelativePathInProject;
  systems: Record<SystemName, RelativePathInProject>;
  gameObjects: (GameObjectSerialized | GroupGameObjectSerialized)[];
}
