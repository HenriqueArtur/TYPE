import {
  Application,
  Assets,
  type Container,
  type Renderer,
  type Sprite,
  type Texture,
} from "pixi.js";
import { DRAWABLE_COMPONENTS } from "../../Component/Drawable/__const__";
import type { Drawable } from "../../Component/Drawable/__type__";
import type { TypeEngine } from "../../TypeEngine";
import { joinPath } from "../../Utils/path";
import type { EventEngine } from "../Event/EventEngine";

export interface RenderEngineOptions {
  html_tag_id?: string;
  width: number;
  height: number;
  EventEngine: EventEngine;
  engine: TypeEngine;
}

export class RenderEngine {
  private engine: TypeEngine;
  private static app: Application | null = null;
  _instance: Application<Renderer>;
  private eventEngine: EventEngine;
  private drawablesMap: Map<string, Map<string, Drawable<Container, unknown>[]>> = new Map();
  private boundHandleRemoveDrawable: (data: {
    entityId: string;
    componentName: string;
    componentData: Drawable<Container, unknown>;
  }) => void;
  private boundHandleAddDrawable: (
    entityId: string,
    componentName: string,
    componentData: Drawable<Container, unknown>,
  ) => void;
  private tag: string;
  private render_window: { width: number; height: number };

  constructor(data: RenderEngineOptions) {
    this.engine = data.engine;
    this.eventEngine = data.EventEngine;
    this.boundHandleRemoveDrawable = this.handleRemoveDrawable.bind(this);
    this.boundHandleAddDrawable = this.handleAddDrawable.bind(this);
    this._instance = new Application();
    this.render_window = {
      width: data?.width ?? 800,
      height: data?.height ?? 600,
    };
    this.tag = data?.html_tag_id ?? "game";
  }

  async setup() {
    await this._instance.init({ ...this.render_window, backgroundColor: 0x1099bb });
    document.getElementById(this.tag)?.appendChild(this._instance.canvas as unknown as Node);
    this.eventEngine.on("remove:drawable", this.boundHandleRemoveDrawable);
    this.eventEngine.on("add:drawable", this.boundHandleAddDrawable);
  }

  async setupScene(): Promise<void> {
    const drawable_entities =
      this.engine.EntityEngine.queryWithAny<Record<string, Drawable<Container, unknown>[]>>(
        DRAWABLE_COMPONENTS,
      );

    for (const { entityId, components } of drawable_entities) {
      for (const [name, entityComponentList] of Object.entries(components)) {
        for (const currentDrawable of entityComponentList) {
          await this.setupByResouce(name, currentDrawable);
          this._instance.stage.addChild(currentDrawable._drawable);
          const entityRef = this.drawablesMap.get(entityId);
          if (!entityRef) {
            const componentsMap = new Map();
            componentsMap.set(name, [currentDrawable]);
            this.drawablesMap.set(entityId, componentsMap);
            continue;
          }
          const componentsRef = entityRef.get(name);
          if (!componentsRef) {
            entityRef.set(name, [currentDrawable]);
            continue;
          }
          entityRef.set(name, [...componentsRef, currentDrawable]);
        }
      }
    }
  }

  private async setupByResouce(
    componentName: string,
    currentComponent: Drawable<Container, unknown>,
  ) {
    if (typeof currentComponent._resource === "string") {
      const imgPath = await window.electronAPI.absolutePath(
        joinPath(this.engine.projectPath, currentComponent._resource),
      );
      const texture = await Assets.load<Texture>(imgPath);
      (currentComponent._drawable as Sprite).texture = texture;
      return;
    }

    // Handle shape components (Rectangle and Circle) that use object resources
    if (componentName === "RectangleComponent" || componentName === "CircleComponent") {
      // Graphics-based components don't need resource setup - they're already created
      return;
    }

    throw new Error(`Pixi.js Drawable "${componentName}" not implemented.`);
  }

  /**
   * Handle remove:drawable events by removing sprites from the container
   * @param data - Event data containing entityId, componentName, and componentData
   */
  private handleRemoveDrawable(data: {
    entityId: string;
    componentName: string;
    componentData: Drawable<Container, unknown>;
  }): void {
    const drawablesMap = this.drawablesMap.get(data.entityId);
    if (drawablesMap) {
      const drawablesList = drawablesMap.get(data.componentName);
      if (drawablesList && drawablesList.length > 0) {
        const index = drawablesList.indexOf(data.componentData);
        if (index !== -1) {
          const drawable = drawablesList[index];
          if (this._instance.stage && drawable._drawable) {
            this._instance.stage.removeChild(drawable._drawable);
          }
          drawablesList.splice(index, 1);

          if (drawablesList.length === 0) {
            drawablesMap.delete(data.componentName);
          } else {
            drawablesMap.set(data.componentName, drawablesList);
          }
        }
        if (drawablesMap.size === 0) {
          this.drawablesMap.delete(data.entityId);
        }
      }
    }
  }

  /**
   * Handle add:drawable events by adding sprites to the container
   * @param data - Event data containing entityId, componentName, and componentData
   */
  private async handleAddDrawable(
    entityId: string,
    componentName: string,
    componentData: Drawable<Container, unknown>,
  ): Promise<void> {
    // Setup the drawable resource
    await this.setupByResouce(componentName, componentData);

    // Add to stage
    this._instance.stage.addChild(componentData._drawable);

    // Add to tracking map
    const entityRef = this.drawablesMap.get(entityId);
    if (!entityRef) {
      const componentsMap = new Map();
      componentsMap.set(componentName, [componentData]);
      this.drawablesMap.set(entityId, componentsMap);
      return;
    }

    const componentsRef = entityRef.get(componentName);
    if (!componentsRef) {
      entityRef.set(componentName, [componentData]);
      return;
    }

    componentsRef.push(componentData);
    entityRef.set(componentName, componentsRef);
  }

  destroy(_engine: TypeEngine): void {
    // Clean up event listeners
    this.eventEngine.off("remove:drawable", this.boundHandleRemoveDrawable);
    this.eventEngine.off("add:drawable", this.boundHandleAddDrawable);

    if (RenderEngine.app) {
      RenderEngine.app.destroy();
      RenderEngine.app = null;
    }
    this.drawablesMap.clear();
  }

  clear() {
    this._instance.stage.removeChildren();
  }
}
