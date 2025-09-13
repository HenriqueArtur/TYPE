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

export class PipeSystem implements System<TypeEngine> {
  name = "PipeSystem";
  priority = 7;
  enabled = true;

  private maxPipesInScene = 1;

  async init(_engine: TypeEngine): Promise<void> {}

  update(engine: TypeEngine, _deltaTime: number): void {
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

  private spawnPipe(engine: TypeEngine): void {
    const canvasHeight = 600;
    const pipeWidth = 60;
    const pipeGap = 150;
    const x = 400;

    const gapCenterY = canvasHeight / 2;
    const topPipeHeight = gapCenterY - pipeGap / 2;
    const bottomPipeHeight = gapCenterY - pipeGap / 2;

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
