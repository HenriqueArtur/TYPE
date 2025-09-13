import type { RigidBodyCircleComponent } from "../../__Engine__/Component/Physics/RigidBodyCircleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { GameStateComponent } from "./GameStateComponent.component";

export class BirdBoundsCheckSystem implements System<TypeEngine> {
  name = "BirdBoundsCheckSystem";
  priority = 7;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // System initialization
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    // Get GameState to check if already paused
    const gameStateEntities = engine.EntityEngine.queryWithAny<{
      GameStateComponent: GameStateComponent[];
    }>(["GameStateComponent"]);

    if (gameStateEntities.length === 0) return;
    const gameState = gameStateEntities[0].components.GameStateComponent[0];

    // Don't check bounds if already paused
    if (gameState.isPaused) return;

    const birdEntities = engine.EntityEngine.queryWithAny<{
      RigidBodyCircleComponent: RigidBodyCircleComponent[];
    }>(["RigidBodyCircleComponent"]);

    for (const { components } of birdEntities) {
      const physicsBody = components.RigidBodyCircleComponent[0];

      // Check if bird hit the bottom of the screen (y=600, bird radius=20, so bottom collision at y=580)
      if (physicsBody.y >= 560) {
        // Trigger pause event
        engine.EventEngine.emit("pause", engine);
        break; // Only need to check once
      }
    }
  }

  destroy(_engine: TypeEngine): void {
    // Cleanup resources if needed
  }
}
