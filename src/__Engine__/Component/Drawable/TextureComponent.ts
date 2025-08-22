import { Assets, type Texture } from "pixi.js";
import type { DrawableComponent } from "../DrawableComponent";

export interface TextureComponentData {
  path: string;
}

export class TextureComponent implements DrawableComponent {
  static readonly _type = "TextureComponent";
  readonly type = TextureComponent._type;
  static readonly prefix = "TX";
  readonly path: string;
  private _instance: Texture | null = null;

  constructor(data: TextureComponentData) {
    // The ".." is needed to adjust asset paths after Electron build
    // Handle different path formats intelligently:
    if (!data.path) {
      // Throw error for undefined/null/empty path
      throw new Error("TextureComponent: 'path' must be a non-empty string.");
    } else if (data.path.startsWith("/")) {
      // If absolute path (starts with "/"), add only ".."
      this.path = `..${data.path}`;
    } else {
      // If relative path, add "../"
      this.path = `../${data.path}`;
    }
  }

  async load() {
    const texture = await Assets.load(this.path);
    this._instance = texture;
    return this._instance as Texture;
  }

  instance() {
    return this._instance as Texture;
  }

  // DrawableComponent interface implementation
  getDrawable(): Texture | null {
    return this._instance;
  }

  updateVisual(_data: Record<string, unknown>): void {
    // Texture doesn't have updatable visual properties, but implement for interface
    console.warn("TextureComponent: updateVisual called but textures are immutable");
  }

  isVisible(): boolean {
    return this._instance !== null;
  }

  setVisible(_visible: boolean): void {
    // Texture visibility is handled by the sprite that uses it
    console.warn("TextureComponent: setVisible called but visibility is handled by sprite");
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
      this._instance.destroy();
      this._instance = null;
    }
  }

  static jsonToGameObject(json: string | object): TextureComponent {
    const data: TextureComponent = typeof json === "string" ? JSON.parse(json) : json;
    return new TextureComponent(data);
  }
}
