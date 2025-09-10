import type { RectangleComponent } from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { GameStateComponent } from "./GameStateComponent.component";
import type { PipeMovementComponent } from "./PipeMovementComponent.component";

export class PipeMovementSystem implements System<TypeEngine> {
  name = "PipeMovementSystem";
  priority = 2;
  enabled = true;

  init(_engine: TypeEngine): void | Promise<void> {}

  update(engine: TypeEngine, deltaTime: number): void {
    const gameStateEntities = engine.EntityEngine.query(["GameStateComponent"]);

    // Check if game is paused or over
    let isGameActive = true;
    for (const entity of gameStateEntities) {
      const [gameState] = engine.EntityEngine.getComponent<GameStateComponent>(
        entity.entityId,
        "GameStateComponent",
      );
      if (gameState && (gameState.isPaused || gameState.isGameOver)) {
        isGameActive = false;
        break;
      }
    }

    if (!isGameActive) return;

    // Get all entities with pipe movement and rectangle components
    const pipeEntities = engine.EntityEngine.queryWithAny([
      "PipeMovementComponent",
      "RectangleComponent",
    ]);

    for (const entity of pipeEntities) {
      const [pipeMovement] = engine.EntityEngine.getComponent<PipeMovementComponent>(
        entity.entityId,
        "PipeMovementComponent",
      );
      const [rectangle] = engine.EntityEngine.getComponent<RectangleComponent>(
        entity.entityId,
        "RectangleComponent",
      );

      if (pipeMovement && rectangle) {
        // Move pipe to the left
        rectangle.position.x -= pipeMovement.speed * deltaTime;

        // Reset pipe position when it goes off screen
        if (rectangle.position.x < -rectangle.width) {
          rectangle.position.x = 800 + rectangle.width; // Reset to right side
        }
      }
    }
  }
}
