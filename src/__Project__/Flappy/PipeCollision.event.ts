import type { EntityFetchResult } from "../../__Engine__/Engines/Entity/__types__";
import type { TypeEngine } from "../../__Engine__/TypeEngine";

interface EventHandler {
  handler: (engine: TypeEngine, otherEntity: EntityFetchResult<Record<string, unknown>>) => void;
}

const eventHandler: EventHandler = {
  handler: (engine: TypeEngine, otherEntity: EntityFetchResult<Record<string, unknown>>): void => {
    if (otherEntity?.entityId?.startsWith("pipe_")) {
      engine.EventEngine.emit("pause", engine);
    }
  },
};

export default eventHandler;
