import type { MouseComponent } from "../../__Engine__/Component/Input/MouseComponent";
import type { RigidBodyCircleComponent } from "../../__Engine__/Component/Physics/RigidBodyCircleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { GameStateComponent } from "./GameStateComponent.component";

export class BirdJumpSystem implements System<TypeEngine> {
  name = "BirdJumpSystem";
  priority = 6;
  enabled = true;
  times = 0;

  async init(_engine: TypeEngine): Promise<void> {
    // System initialization
  }

  update(engine: TypeEngine, deltaTime: number): void {
    // Get GameState to check timing
    const gameStateEntities = engine.EntityEngine.queryWithAny<{
      GameStateComponent: GameStateComponent[];
    }>(["GameStateComponent"]);

    if (gameStateEntities.length === 0) return;
    const gameState = gameStateEntities[0].components.GameStateComponent[0];

    // Don't allow jumping or update timing if game is paused
    if (gameState.isPaused) return;

    // Update timing
    gameState.timeToNextJump -= deltaTime;

    const birdEntities = engine.EntityEngine.queryWithAny<{
      RigidBodyCircleComponent: RigidBodyCircleComponent[];
      MouseComponent: MouseComponent[];
    }>(["RigidBodyCircleComponent", "MouseComponent"]);

    for (const { components } of birdEntities) {
      const physicsBody = components.RigidBodyCircleComponent[0];
      const mouseInput = components.MouseComponent[0];

      if (mouseInput.buttons.left && gameState.timeToNextJump <= 0) {
        const jumpForce = { x: 0, y: -230 };
        const bodyPosition = { x: physicsBody.x, y: physicsBody.y };
        engine.PhysicsEngine.applyForce(physicsBody._body, bodyPosition, jumpForce);

        // Reset jump timing
        gameState.timeToNextJump = gameState.timeToJump;
      }
    }
  }

  destroy(_engine: TypeEngine): void {
    // Cleanup resources if needed
  }
}
