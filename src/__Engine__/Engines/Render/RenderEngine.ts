import { Application, Assets, type Container, type Renderer, type Texture } from "pixi.js";
import type { SpriteComponent } from "../../Component";
import type { TypeEngine } from "../../TypeEngine";

export interface RenderEngineOptions {
  html_tag_id?: string;
  width: number;
  height: number;
}

export class RenderEngine {
  private static app: Application | null = null;
  private static container: Container | null = null;
  _instance: Application<Renderer>;

  constructor(data?: RenderEngineOptions) {
    this._instance = new Application();
    const render_window = {
      width: data?.width ?? 800,
      height: data?.height ?? 600,
    };
    this._instance.init({ ...render_window, backgroundColor: 0x1099bb });
    document
      .getElementById(data?.html_tag_id ?? "game")
      ?.appendChild(this._instance.canvas as unknown as Node);
  }

  destroy(_engine: TypeEngine): void {
    if (RenderEngine.app) {
      RenderEngine.app.destroy();
      RenderEngine.app = null;
    }
    RenderEngine.container = null;
  }

  async loadAllSprites(engine: TypeEngine): Promise<void> {
    if (!RenderEngine.container) return;
    const sprite_entities = engine.queryEntities<{ SpriteComponent: SpriteComponent }>([
      "SpriteComponent",
    ]);
    for (const { components } of sprite_entities) {
      const sprite_component = components.SpriteComponent;
      const texture = await Assets.load<Texture>(sprite_component.texture_path);
      sprite_component._sprite.texture = texture;
      RenderEngine.container.addChild(sprite_component._sprite);
    }
  }
}
