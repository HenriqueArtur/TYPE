import type { RelativePathInProject } from "../../Utils/Types";

export type SceneName = string;

export interface SceneManageSerialized {
  initialScene: SceneName;
  scenes: Record<SceneName, RelativePathInProject>;
}
