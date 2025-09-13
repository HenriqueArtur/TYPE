import { Body as MatterBody } from "matter-js";
import type { RectangleComponent } from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import type { MouseComponent } from "../../__Engine__/Component/Input/MouseComponent";
import type { RigidBodyCircleComponent } from "../../__Engine__/Component/Physics/RigidBodyCircleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { GameStateComponent } from "./GameStateComponent.component";

export class GameRestartSystem implements System<TypeEngine> {
  name = "GameRestartSystem";
  priority = 8;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // System initialization
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    // Get GameState to check if paused
    const gameStateEntities = engine.EntityEngine.query<{
      GameStateComponent: GameStateComponent[];
      RectangleComponent: RectangleComponent[];
    }>(["GameStateComponent", "RectangleComponent"]);

    if (gameStateEntities.length === 0) return;

    const gameStateEntity = gameStateEntities[0];
    const gameState = gameStateEntity.components.GameStateComponent[0];
    const rectangle = gameStateEntity.components.RectangleComponent[0];

    // Only proceed if game is paused
    if (!gameState.isPaused) return;

    // Check for mouse input on bird entities (they have mouse component)
    const birdEntities = engine.EntityEngine.queryWithAny<{
      RigidBodyCircleComponent: RigidBodyCircleComponent[];
      MouseComponent: MouseComponent[];
    }>(["RigidBodyCircleComponent", "MouseComponent"]);

    for (const { components } of birdEntities) {
      const physicsBody = components.RigidBodyCircleComponent[0];
      const mouseInput = components.MouseComponent[0];

      if (mouseInput.buttons.left) {
        // Remove all existing pipes
        this.clearAllPipes(engine);

        // Reset bird position to starting position
        MatterBody.setPosition(physicsBody._body, { x: 50, y: 300 });

        // Reset bird velocity to zero
        MatterBody.setVelocity(physicsBody._body, { x: 0, y: 0 });

        // Unpause the game
        gameState.isPaused = false;
        rectangle.visible = false;

        // Reactivate physics system by toggling it back on
        engine.SystemEngine.toggle("PhysicsSystem");

        // Reset jump timing
        gameState.timeToNextJump = 0;

        break; // Only need to restart once
      }
    }
  }

  private clearAllPipes(engine: TypeEngine): void {
    const pipeEntities = engine.EntityEngine.query<{
      RectangleComponent: RectangleComponent[];
    }>(["RectangleComponent"]);

    for (const { entityId } of pipeEntities) {
      if (entityId.startsWith("pipe_")) {
        engine.EntityEngine.remove(entityId);
      }
    }
  }

  destroy(_engine: TypeEngine): void {
    // Cleanup resources if needed
  }
}
