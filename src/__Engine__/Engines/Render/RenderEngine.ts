import { Application, Assets, type Renderer, type Texture } from "pixi.js";
import type { SpriteComponent } from "../../Component/Drawable/SpriteComponent";
import type { TypeEngine } from "../../TypeEngine";
import type { EventEngine } from "../Event/EventEngine";

export interface RenderEngineOptions {
  html_tag_id?: string;
  width: number;
  height: number;
  eventEngine: EventEngine;
}

export class RenderEngine {
  private static app: Application | null = null;
  _instance: Application<Renderer>;
  private eventEngine: EventEngine;
  private spriteMap: Map<string, SpriteComponent> = new Map();
  private boundHandleRemoveDrawable: (data: {
    entityId: string;
    componentName: string;
    componentData: unknown;
  }) => void;
  private tag: string;
  private render_window: { width: number; height: number };

  constructor(data: RenderEngineOptions) {
    this.eventEngine = data.eventEngine;
    this.boundHandleRemoveDrawable = this.handleRemoveDrawable.bind(this);
    this._instance = new Application();
    this.render_window = {
      width: data?.width ?? 800,
      height: data?.height ?? 600,
    };
    this.tag = data?.html_tag_id ?? "game";
  }

  async start() {
    await this._instance.init({ ...this.render_window, backgroundColor: 0x1099bb });
    document.getElementById(this.tag)?.appendChild(this._instance.canvas as unknown as Node);
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for render-related events
   */
  private setupEventListeners(): void {
    this.eventEngine.on("remove:drawable", this.boundHandleRemoveDrawable);
  }

  /**
   * Handle remove:drawable events by removing sprites from the container
   * @param data - Event data containing entityId, componentName, and componentData
   */
  private handleRemoveDrawable(data: {
    entityId: string;
    componentName: string;
    componentData: unknown;
  }): void {
    const spriteComponent = this.spriteMap.get(data.entityId);
    if (spriteComponent) {
      // Remove from stage if it exists
      if (this._instance.stage) {
        this._instance.stage.removeChild(spriteComponent._sprite);
      }
      // Always remove from our tracking map
      this.spriteMap.delete(data.entityId);
    }
  }

  destroy(_engine: TypeEngine): void {
    // Clean up event listeners
    this.eventEngine.off("remove:drawable", this.boundHandleRemoveDrawable);

    if (RenderEngine.app) {
      RenderEngine.app.destroy();
      RenderEngine.app = null;
    }
    this.spriteMap.clear();
  }

  async loadAllSprites(engine: TypeEngine): Promise<void> {
    const sprite_entities = engine.queryEntities<{ SpriteComponent: SpriteComponent }>([
      "SpriteComponent",
    ]);
    for (const { entityId, components } of sprite_entities) {
      const sprite_component = components.SpriteComponent;
      const texture = await Assets.load<Texture>(sprite_component.texture_path);
      sprite_component._sprite.texture = texture;
      this._instance.stage.addChild(sprite_component._sprite);

      // Track sprite for later removal
      this.spriteMap.set(entityId, sprite_component);
    }
  }
}
