import { Sprite } from "pixi.js";
import { Angle } from "../../Utils/Angle";
import type { DrawableComponent } from "../DrawableComponent";
import {
  TransformComponent,
  type TransformComponentData,
} from "../Transformable/TransformComponent";
import { TextureComponent } from "./TextureComponent";

export type SpriteComponentData = TransformComponentData & {
  texture: TextureComponent;
};

export type SpriteComponentDataJson = Omit<SpriteComponentData, "texture" | "rotation"> & {
  readonly texture: string;
  readonly rotation: number;
};

export class SpriteComponent implements DrawableComponent {
  static readonly _type = "SpriteComponent";
  readonly type = SpriteComponent._type;
  static readonly prefix = "SP";
  readonly texture: TextureComponent;
  readonly _transform: TransformComponent;
  private _instance: Sprite | null = null;

  constructor({ texture, ...transform }: SpriteComponentData) {
    this.texture = texture;
    this._transform = new TransformComponent(transform);
  }

  transform(data: Omit<TransformComponentData, "id">) {
    this._transform.set(data);

    // Only update sprite instance if it's loaded and has proper properties
    if (this._instance?.position && this._instance.scale) {
      if (data.position?.x) {
        this._instance.position.x = data.position.x;
      }
      if (data.position?.y) {
        this._instance.position.y = data.position.y;
      }
      if (data.scale?.x) {
        this._instance.scale.x = data.scale.x;
      }
      if (data.scale?.y) {
        this._instance.scale.y = data.scale.y;
      }
      if (data.rotation) {
        this._instance.rotation = data.rotation.degrees;
      }
    }
  }

  async load() {
    const { position, scale, rotation } = this._transform.value();
    const texture = await this.texture.load();
    this._instance = new Sprite({
      texture,
      position,
      scale,
      rotation: rotation.degrees,
      anchor: 0.5,
    });
    return this._instance as Sprite;
  }

  instance() {
    return this._instance as Sprite;
  }

  // DrawableComponent interface implementation
  getDrawable(): Sprite | null {
    return this._instance;
  }

  updateVisual(data: Record<string, unknown>): void {
    if (this._instance) {
      if (data.alpha !== undefined && typeof data.alpha === "number") {
        this._instance.alpha = data.alpha;
      }
      if (data.tint !== undefined && typeof data.tint === "number") {
        this._instance.tint = data.tint;
      }
      if (data.blendMode !== undefined && typeof data.blendMode === "string") {
        // Handle blend mode if needed
      }
    }
  }

  isVisible(): boolean {
    return this._instance?.visible ?? false;
  }

  setVisible(visible: boolean): void {
    if (this._instance) {
      this._instance.visible = visible;
    }
  }

  getDimensions(): { width: number; height: number } | null {
    if (this._instance) {
      return {
        width: this._instance.width,
        height: this._instance.height,
      };
    }
    return null;
  }

  destroy(): void {
    if (this._instance) {
      // Remove from parent if it has one
      if (this._instance.parent) {
        this._instance.parent.removeChild(this._instance);
      }
      // Destroy the sprite instance only if it has a destroy method
      if (typeof this._instance.destroy === "function") {
        this._instance.destroy();
      }
      this._instance = null;
    }

    // Destroy the texture component
    this.texture.destroy();

    // Destroy the transform component
    this._transform.destroy();
  }

  static jsonToGameObject(json: string | object): SpriteComponent {
    const data: SpriteComponentDataJson = typeof json === "string" ? JSON.parse(json) : json;
    const texture = new TextureComponent({ path: data.texture });
    const rotation = Angle.fromDegrees(data.rotation);
    return new SpriteComponent({
      ...data,
      rotation,
      texture,
    });
  }
}
