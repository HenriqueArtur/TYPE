import { InjectDependencies } from "../__Engine__/GameObject/InjectDependencies";
import { Bunny } from "./Bunny";
import initial_values from "./Bunny.obj.json"

const BUNNY_LOADED = InjectDependencies(Bunny, initial_values)

export default BUNNY_LOADED
