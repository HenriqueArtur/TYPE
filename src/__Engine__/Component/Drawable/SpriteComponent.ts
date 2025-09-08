import { type Container, Sprite, Texture } from "pixi.js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { Drawable } from "./__type__";

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

export type SpriteComponent = Required<Omit<SpriteComponentData, "texture_path" | "tint">> & {
  tint?: number;
} & Drawable<Sprite, string>;

export const SPRITE_COMPONENT: ComponentInstanceManage<
  "SpriteComponent",
  SpriteComponentData,
  SpriteComponent
> = {
  name: "SpriteComponent",
  create: (data: SpriteComponentData): SpriteComponent => {
    const beforeDrawable = {
      position: data.position ?? { x: 0, y: 0 },
      scale: data.scale ?? { x: 1, y: 1 },
      rotation: data.rotation ?? 0,
      alpha: data.alpha ?? 1,
      tint: data.tint,
      visible: data.visible ?? true,
      anchor: data.anchor ?? 0.5,
      _resource: data.texture_path,
      _drawable: null as null | Container,
    };
    beforeDrawable._drawable = new Sprite({
      texture: Texture.EMPTY,
      position: { x: beforeDrawable.position.x, y: beforeDrawable.position.y },
      scale: { x: beforeDrawable.scale.x, y: beforeDrawable.scale.y },
      rotation: beforeDrawable.rotation,
      alpha: beforeDrawable.alpha,
      tint: beforeDrawable.tint,
      anchor: beforeDrawable.anchor,
      visible: beforeDrawable.visible,
    });
    return beforeDrawable as SpriteComponent;
  },
  serialize: ({
    _resource,
    _drawable,
    ...component
  }: SpriteComponent): ComponentSerialized<"SpriteComponent", SpriteComponentData> => ({
    name: "SpriteComponent",
    data: {
      ...component,
      texture_path: _resource,
    },
  }),
};
