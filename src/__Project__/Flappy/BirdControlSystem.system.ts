import type { CircleComponent } from "../../__Engine__/Component/Drawable/Shapes/CircleComponent";
import type { MouseComponent } from "../../__Engine__/Component/Input/MouseComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { BirdControlComponent } from "./BirdControlComponent.component";
import type { GameStateComponent } from "./GameStateComponent.component";

export class BirdControlSystem implements System<TypeEngine> {
  name = "BirdControlSystem";
  priority = 1;
  enabled = true;

  init(_engine: TypeEngine): void | Promise<void> {}

  update(engine: TypeEngine, deltaTime: number): void {
    const gameStateEntities = engine.EntityEngine.query<{
      SpriteComponent: [GameStateComponent];
    }>(["GameStateComponent"]);

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

    // Get all entities with bird control and circle components
    const birdEntities = engine.EntityEngine.queryWithAny([
      "BirdControlComponent",
      "CircleComponent",
      "MouseComponent",
    ]);

    for (const entity of birdEntities) {
      const [birdControl] = engine.EntityEngine.getComponent<BirdControlComponent>(
        entity.entityId,
        "BirdControlComponent",
      );
      const [circle] = engine.EntityEngine.getComponent<CircleComponent>(
        entity.entityId,
        "CircleComponent",
      );
      const [mouse] = engine.EntityEngine.getComponent<MouseComponent>(
        entity.entityId,
        "MouseComponent",
      );

      if (birdControl && circle && mouse) {
        // Apply gravity
        birdControl.velocity.y += birdControl.gravity * deltaTime;

        // Check for jump input (left mouse button)
        if (mouse.buttons.left) {
          birdControl.velocity.y = -birdControl.jumpForce;
          // Reset the button state to prevent continuous jumping
          mouse.buttons.left = false;
        }

        // Update bird position
        circle.position.y += birdControl.velocity.y * deltaTime;

        // Clamp bird to screen bounds (optional)
        if (circle.position.y < 0) {
          circle.position.y = 0;
          birdControl.velocity.y = 0;
        }
        if (circle.position.y > 600) {
          // Assume 600px height
          circle.position.y = 600;
          birdControl.velocity.y = 0;
        }
      }
    }
  }
}
