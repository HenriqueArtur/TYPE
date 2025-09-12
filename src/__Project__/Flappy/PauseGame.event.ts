import type { RectangleComponent } from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { GameStateComponent } from "./GameStateComponent.component";

interface EventHandler {
  event: string;
  handler: (engine: TypeEngine, ...args: unknown[]) => void;
}

const eventHandler: EventHandler = {
  event: "pause",
  handler: (engine: TypeEngine): void => {
    // Query entities with GameState components
    const gameStateEntities = engine.EntityEngine.query<{
      GameStateComponent: GameStateComponent[];
      RectangleComponent: RectangleComponent[];
    }>(["GameStateComponent", "RectangleComponent"]);

    for (const { components } of gameStateEntities) {
      const gameState = components.GameStateComponent[0];
      const rectangle = components.RectangleComponent[0];

      // Toggle pause state
      gameState.isPaused = !gameState.isPaused;

      // Show/hide red rectangle based on pause state
      rectangle.visible = gameState.isPaused;

      console.log(`Game ${gameState.isPaused ? "paused" : "unpaused"}`);
    }
  },
};

export default eventHandler;
