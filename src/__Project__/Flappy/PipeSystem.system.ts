import {
  RECTANGLE_COMPONENT,
  type RectangleComponent,
} from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import {
  COLLIDER_RECTANGLE_COMPONENT,
  type ColliderRectangleComponent,
} from "../../__Engine__/Component/Physics/ColliderRectangleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import { generateId } from "../../__Engine__/Utils/id";
import type { GameStateComponent } from "./GameStateComponent.component";

export class PipeSystem implements System<TypeEngine> {
  name = "PipeSystem";
  priority = 7;
  enabled = true;

  private maxPipesInScene = 3;
  private pipeSpeed = 200; // pixels per second
  private spawnDistance = 300; // distance between pipes

  async init(_engine: TypeEngine): Promise<void> {}

  update(engine: TypeEngine, deltaTime: number): void {
    // Check if game is paused
    const gameStateEntities = engine.EntityEngine.queryWithAny<{
      GameStateComponent: GameStateComponent[];
    }>(["GameStateComponent"]);

    if (gameStateEntities.length > 0) {
      const gameState = gameStateEntities[0].components.GameStateComponent[0];
      if (gameState.isPaused) return; // Don't update pipes if game is paused
    }

    this.movePipes(engine, deltaTime);
    this.removeOffScreenPipes(engine);

    const pipeCount = this.countPipesInScene(engine);
    if (pipeCount < this.maxPipesInScene) {
      this.spawnPipe(engine);
    }
  }

  private countPipesInScene(engine: TypeEngine): number {
    const pipeEntities = engine.EntityEngine.query<{
      RectangleComponent: RectangleComponent[];
    }>(["RectangleComponent"]);

    let count = 0;
    for (const { entityId } of pipeEntities) {
      if (entityId.startsWith("pipe_")) {
        count++;
      }
    }

    return count / 2; // Each pipe pair consists of 2 entities (top and bottom)
  }

  private movePipes(engine: TypeEngine, deltaTime: number): void {
    const pipeEntities = engine.EntityEngine.queryWithAny<{
      RectangleComponent: RectangleComponent[];
      ColliderRectangleComponent: ColliderRectangleComponent[];
    }>(["RectangleComponent", "ColliderRectangleComponent"]);

    for (const { entityId, components } of pipeEntities) {
      if (entityId.startsWith("pipe_")) {
        const rectangle = components.RectangleComponent[0];
        const collider = components.ColliderRectangleComponent[0];

        // Move pipe to the left
        const deltaX = (this.pipeSpeed * deltaTime) / 1000; // Convert to seconds
        rectangle.position.x -= deltaX;
        collider.x -= deltaX;
        engine.PhysicsEngine.setPosition(collider._body, {
          x: collider._body.position.x - deltaX,
          y: collider._body.position.y,
        });
      }
    }
  }

  private removeOffScreenPipes(engine: TypeEngine): void {
    const pipeEntities = engine.EntityEngine.query<{
      RectangleComponent: RectangleComponent[];
    }>(["RectangleComponent"]);

    for (const { entityId, components } of pipeEntities) {
      if (entityId.startsWith("pipe_")) {
        const rectangle = components.RectangleComponent[0];

        // Remove pipes that are completely off screen (left side)
        if (rectangle.position.x < -100) {
          engine.EntityEngine.remove(entityId);
        }
      }
    }
  }

  private getLastPipePosition(engine: TypeEngine): number {
    const pipeEntities = engine.EntityEngine.query<{
      RectangleComponent: RectangleComponent[];
    }>(["RectangleComponent"]);

    let rightmostX = -Infinity;

    for (const { entityId, components } of pipeEntities) {
      if (entityId.startsWith("pipe_")) {
        const rectangle = components.RectangleComponent[0];
        if (rectangle.position.x > rightmostX) {
          rightmostX = rectangle.position.x;
        }
      }
    }

    return rightmostX === -Infinity ? 600 : rightmostX; // Start at screen edge if no pipes exist
  }

  private spawnPipe(engine: TypeEngine): void {
    const canvasHeight = 600;
    const pipeWidth = 60;
    const pipeGap = 240;

    // Spawn new pipes at a distance from the last pipe
    const lastPipeX = this.getLastPipePosition(engine);
    const x = lastPipeX + this.spawnDistance;

    // Randomize gap position
    const minGapY = pipeGap / 2 + 50; // 50px from top
    const maxGapY = canvasHeight - pipeGap / 2 - 50; // 50px from bottom
    const gapCenterY = Math.random() * (maxGapY - minGapY) + minGapY;

    const topPipeHeight = gapCenterY - pipeGap / 2;
    const bottomPipeHeight = canvasHeight - (gapCenterY + pipeGap / 2);

    // Create top pipe
    this.createPipeRect(engine, x, topPipeHeight / 2, pipeWidth, topPipeHeight, "top");

    // Create bottom pipe
    this.createPipeRect(
      engine,
      x,
      canvasHeight - bottomPipeHeight / 2,
      pipeWidth,
      bottomPipeHeight,
      "bottom",
    );
  }

  private createPipeRect(
    engine: TypeEngine,
    x: number,
    y: number,
    width: number,
    height: number,
    type: "top" | "bottom",
  ): void {
    const pipeEntity = engine.EntityEngine.create(`pipe_${type}_${generateId()}`);

    const rectangleComponent: RectangleComponent = RECTANGLE_COMPONENT.create({
      width,
      height,
      position: { x, y },
      scale: { x: 1, y: 1 },
      rotation: 0,
      alpha: 1,
      visible: true,
      anchor: 0.5,
      fill: {
        enabled: true,
        color: "#06402B",
      },
    });

    const colliderComponent: ColliderRectangleComponent = COLLIDER_RECTANGLE_COMPONENT.create({
      x,
      y,
      width,
      height,
    });

    engine.EntityEngine.addComponent(pipeEntity, "RectangleComponent", rectangleComponent);
    engine.EntityEngine.addComponent(pipeEntity, "ColliderRectangleComponent", colliderComponent);
  }
}
