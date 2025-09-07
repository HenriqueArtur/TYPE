import type { ComponentSerialized } from "../../Component/ComponentInstanceManage";
import type { RelativePathInProject } from "../../Utils/Types";

export interface BlueprintSerialized {
  name: string;
  path: RelativePathInProject;
  components: ComponentSerialized<string, unknown>[];
}

export interface GameObjectSerialized {
  name: string;
  blueprint: {
    name: string;
    path: RelativePathInProject;
  };
  components: ComponentSerialized<string, unknown>[];
}

export interface GroupGameObjectSerialized {
  name: string;
  list: (GameObjectSerialized | GroupGameObjectSerialized)[];
}
