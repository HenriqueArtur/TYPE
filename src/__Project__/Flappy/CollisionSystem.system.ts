import type { CircleComponent } from "../../__Engine__/Component/Drawable/Shapes/CircleComponent";
import type { RectangleComponent } from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import type { MouseComponent } from "../../__Engine__/Component/Input/MouseComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { BirdControlComponent } from "./BirdControlComponent.component";
import type { GameStateComponent } from "./GameStateComponent.component";

export class CollisionSystem implements System<TypeEngine> {
  name = "CollisionSystem";
  priority = 3;
  enabled = true;

  init(_engine: TypeEngine): void | Promise<void> {}

  update(engine: TypeEngine, _deltaTime: number): void {
    const gameStateEntities = engine.EntityEngine.query(["GameStateComponent"]);

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

    // Only check collisions if game is active
    if (!gameState.isGameOver && !gameState.isPaused) {
      // Get bird entities
      const birdEntities = engine.EntityEngine.queryWithAny([
        "BirdControlComponent",
        "CircleComponent",
      ]);

      // Get pipe entities
      const pipeEntities = engine.EntityEngine.queryWithAny([
        "PipeMovementComponent",
        "RectangleComponent",
      ]);

      // Check collisions between bird and pipes
      for (const birdEntity of birdEntities) {
        const [birdCircle] = engine.EntityEngine.getComponent<CircleComponent>(
          birdEntity.entityId,
          "CircleComponent",
        );
        if (!birdCircle) continue;

        for (const pipeEntity of pipeEntities) {
          const [pipeRect] = engine.EntityEngine.getComponent<RectangleComponent>(
            pipeEntity.entityId,
            "RectangleComponent",
          );
          if (!pipeRect) continue;

          // Simple circle-rectangle collision detection
          if (
            this.circleRectCollision(
              birdCircle.position.x,
              birdCircle.position.y,
              birdCircle.radius,
              pipeRect.position.x - pipeRect.width * pipeRect.anchor,
              pipeRect.position.y - pipeRect.height * pipeRect.anchor,
              pipeRect.width,
              pipeRect.height,
            )
          ) {
            // Collision detected - set game over
            gameState.isGameOver = true;
            gameState.isPaused = true;
            return;
          }
        }
      }
    }

    // Handle restart input when game is over
    if (gameState.isGameOver) {
      // Get entities with mouse input
      const mouseEntities = engine.EntityEngine.query(["MouseComponent"]);

      for (const entity of mouseEntities) {
        const [mouse] = engine.EntityEngine.getComponent<MouseComponent>(
          entity.entityId,
          "MouseComponent",
        );
        if (mouse?.buttons.left) {
          // Restart the game
          gameState.isGameOver = false;
          gameState.isPaused = false;

          // Reset bird position and velocity
          const birdEntities = engine.EntityEngine.queryWithAny([
            "BirdControlComponent",
            "CircleComponent",
          ]);

          for (const birdEntity of birdEntities) {
            const [birdCircle] = engine.EntityEngine.getComponent<CircleComponent>(
              birdEntity.entityId,
              "CircleComponent",
            );
            const [birdControl] = engine.EntityEngine.getComponent<BirdControlComponent>(
              birdEntity.entityId,
              "BirdControlComponent",
            );
            if (birdCircle && birdControl) {
              birdCircle.position.x = 100;
              birdCircle.position.y = 300;
              birdControl.velocity.x = 0;
              birdControl.velocity.y = 0;
            }
          }

          // Reset pipe positions
          const pipeEntities = engine.EntityEngine.queryWithAny([
            "PipeMovementComponent",
            "RectangleComponent",
          ]);

          let pipeIndex = 0;
          for (const pipeEntity of pipeEntities) {
            const [pipeRect] = engine.EntityEngine.getComponent<RectangleComponent>(
              pipeEntity.entityId,
              "RectangleComponent",
            );
            if (pipeRect) {
              pipeRect.position.x = 400 + pipeIndex * 200; // Reset pipes with spacing
              pipeIndex++;
            }
          }

          mouse.buttons.left = false;
          return;
        }
      }
    }
  }

  private circleRectCollision(
    circleX: number,
    circleY: number,
    radius: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
  ): boolean {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

    // Calculate the distance between the circle center and the closest point
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    // Check if the distance is less than the circle's radius
    return distanceSquared < radius * radius;
  }
}
