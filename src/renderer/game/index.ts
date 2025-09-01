import { SpriteComponent, type SpriteComponentData } from "../../__Engine__/Component/Drawable";
import { EntityEngine, EventEngine, RenderEngine, TimeEngine } from "../../__Engine__/Engines";
import { SceneEngine } from "../../__Engine__/Engines/Scene/SceneEngine";
import type { SceneManageSerialized } from "../../__Engine__/Engines/Scene/SceneManageSerialized";
import { RenderPixiSystem } from "../../__Engine__/Systems";
import { TypeEngine } from "../../__Engine__/TypeEngine";
import { SCENE_MANAGE } from "../../__Project__";

export async function Game() {
  // Initialize all engine components with dependency injection
  const eventEngine = new EventEngine();
  const renderEngine = new RenderEngine({ width: 800, height: 600, eventEngine });
  const entityEngine = new EntityEngine(eventEngine);

  // Configure scene management - for now use a simple initial scene setup
  const sceneManageData: SceneManageSerialized = SCENE_MANAGE;
  const sceneEngine = new SceneEngine(sceneManageData);
  const timeEngine = new TimeEngine({ fixedFps: 60 });

  // Create TypeEngine with dependency injection
  const engine = new TypeEngine({
    renderEngine,
    entityEngine,
    eventEngine,
    sceneEngine,
    timeEngine,
    systemsList: [],
  });

  engine.registerComponent(
    "SpriteComponent",
    <T = SpriteComponentData>(data: T) => new SpriteComponent(data as SpriteComponentData),
  );
  engine.addSystem(new RenderPixiSystem());

  console.log("beforeSetup");
  await engine.setup();
  console.log("afterSetup");

  const sprite_entities = engine.queryEntities<{ SpriteComponent: SpriteComponent }>([
    "SpriteComponent",
  ]);
  console.log({ sprite_entities });
  // Start the TypeEngine
  engine.start();
}

Game();
