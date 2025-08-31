import type { ComponentSerialized } from "../../Component/ComponentSerialized";
import type { RelativePathInProject } from "../../Utils/Types";

export interface BlueprintSerialized {
  name: string;
  path: RelativePathInProject;
  components: ComponentSerialized[];
}

export interface GameObjectSerialized {
  name: string;
  blueprint: {
    name: string;
    path: RelativePathInProject;
  };
  components: ComponentSerialized[];
}

export interface GroupGameObjectSerialized {
  name: string;
  list: (GameObjectSerialized | GroupGameObjectSerialized)[];
}
