import { type Container, Graphics } from "pixi.js";
import { hexToNumber } from "../../../Utils/Color";
import type { ComponentInstanceManage, ComponentSerialized } from "../../ComponentInstanceManage";
import type { Drawable } from "../__type__";

export interface RectangleComponentData {
  width: number;
  height: number;
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: number;
  alpha?: number;
  visible?: boolean;
  anchor?: number;
  fill?: {
    enabled: boolean;
    color: string;
  };
  stroke?: {
    enabled: boolean;
    color: string;
    width: number;
  };
}

export type RectangleComponent = Required<Omit<RectangleComponentData, "fill" | "stroke">> & {
  fill?: {
    enabled: boolean;
    color: string;
  };
  stroke?: {
    enabled: boolean;
    color: string;
    width: number;
  };
} & Drawable<Graphics, { width: number; height: number }>;

export const RECTANGLE_COMPONENT: ComponentInstanceManage<
  "RectangleComponent",
  RectangleComponentData,
  RectangleComponent
> = {
  name: "RectangleComponent",
  create: (data: RectangleComponentData): RectangleComponent => {
    const beforeDrawable = {
      width: data.width,
      height: data.height,
      position: data.position ?? { x: 0, y: 0 },
      scale: data.scale ?? { x: 1, y: 1 },
      rotation: data.rotation ?? 0,
      alpha: data.alpha ?? 1,
      visible: data.visible ?? true,
      anchor: data.anchor ?? 0.5,
      fill: data.fill,
      stroke: data.stroke,
      _resource: { width: data.width, height: data.height },
      _drawable: null as null | Container,
    };

    const graphics = new Graphics();

    // Draw rectangle with anchor point consideration
    const anchorX = beforeDrawable.width * beforeDrawable.anchor;
    const anchorY = beforeDrawable.height * beforeDrawable.anchor;

    graphics.rect(-anchorX, -anchorY, beforeDrawable.width, beforeDrawable.height);

    // Set fill if enabled
    if (beforeDrawable.fill?.enabled && data.fill?.color) {
      const fillColor = hexToNumber(data.fill.color);
      graphics.fill(fillColor);
    }

    // Set stroke if enabled
    if (beforeDrawable.stroke?.enabled && data.stroke?.color) {
      const strokeColor = hexToNumber(data.stroke.color);
      graphics.stroke({
        color: strokeColor,
        width: beforeDrawable.stroke.width,
      });
    }

    // Set transform properties
    graphics.position.set(beforeDrawable.position.x, beforeDrawable.position.y);
    graphics.scale.set(beforeDrawable.scale.x, beforeDrawable.scale.y);
    graphics.rotation = beforeDrawable.rotation;
    graphics.alpha = beforeDrawable.alpha;
    graphics.visible = beforeDrawable.visible;

    beforeDrawable._drawable = graphics;
    return beforeDrawable as RectangleComponent;
  },
  serialize: ({
    _resource,
    _drawable,
    ...component
  }: RectangleComponent): ComponentSerialized<"RectangleComponent", RectangleComponentData> => ({
    name: "RectangleComponent",
    data: {
      ...component,
    },
  }),
};
