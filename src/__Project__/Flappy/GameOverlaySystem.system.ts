import type { RectangleComponent } from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { GameStateComponent } from "./GameStateComponent.component";

export class GameOverlaySystem implements System<TypeEngine> {
  name = "GameOverlaySystem";
  priority = 4;
  enabled = true;

  init(_engine: TypeEngine): void | Promise<void> {}

  update(engine: TypeEngine, _deltaTime: number): void {
    const gameStateEntities = engine.EntityEngine.query(["GameStateComponent"]);
    const overlayEntities = engine.EntityEngine.query(["RectangleComponent"]);

    // Get game state
    let gameState = null;
    for (const entity of gameStateEntities) {
      gameState = engine.EntityEngine.getComponent<GameStateComponent>(
        entity.entityId,
        "GameStateComponent",
      )[0];
      if (gameState) break;
    }

    if (!gameState) return;

    // Find overlay rectangle (assuming it has a specific name or identifier)
    for (const entity of overlayEntities) {
      const [rectangle] = engine.EntityEngine.getComponent<RectangleComponent>(
        entity.entityId,
        "RectangleComponent",
      );

      // Check if this is the game over overlay (red rectangle)
      if (rectangle && rectangle.fill?.color === "#FF0000") {
        // Show/hide overlay based on game state
        rectangle.visible = gameState.isGameOver || gameState.isPaused;
      }
    }
  }
}
