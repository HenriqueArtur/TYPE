import { Sprite, Texture } from "pixi.js";

export interface SpriteComponentData {
  texture_path: string;
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: number;
  alpha?: number;
  tint?: number;
  visible?: boolean;
  anchor?: number;
}

export class SpriteComponent {
  _sprite: Sprite;
  texture_path: string;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  alpha: number;
  tint?: number;
  anchor: number;
  visible: boolean;

  constructor(data: SpriteComponentData) {
    this.texture_path = formatTexturePath(data.texture_path);
    this.position = data.position ?? { x: 0, y: 0 };
    this.scale = data.scale ?? { x: 1, y: 1 };
    this.rotation = data.rotation ?? 0;
    this.alpha = data.alpha ?? 1;
    this.tint = data.tint;
    this.visible = data.visible ?? true;
    this.anchor = data.anchor ?? 0.5;
    this._sprite = new Sprite({
      texture: Texture.EMPTY,
      position: { x: this.position.x, y: this.position.y },
      scale: { x: this.scale.x, y: this.scale.y },
      rotation: this.rotation,
      alpha: this.alpha,
      tint: this.tint,
      anchor: this.anchor,
      visible: this.visible,
    });
  }
}

function formatTexturePath(path: string): string {
  if (!path) {
    throw new Error("Texture path must be a non-empty string");
  }
  if (path.startsWith("/")) {
    return `..${path}`;
  }
  return `../${path}`;
}
