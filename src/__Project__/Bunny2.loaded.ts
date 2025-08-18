import { InjectDependencies } from "../__Engine__/GameObject/InjectDependencies";
import { Bunny2 } from "./Bunny2";
import initial_values from "./Bunny2.obj.json";

const BUNNY2_LOADED = InjectDependencies(Bunny2, initial_values);

export default BUNNY2_LOADED;
