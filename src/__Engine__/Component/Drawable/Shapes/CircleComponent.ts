import { type Container, Graphics } from "pixi.js";
import { hexToNumber } from "../../../Utils/Color";
import type { ComponentInstanceManage, ComponentSerialized } from "../../ComponentInstanceManage";
import type { Drawable } from "../__type__";

export interface CircleComponentData {
  radius: number;
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: number;
  alpha?: number;
  visible?: boolean;
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

export type CircleComponent = Required<Omit<CircleComponentData, "fill" | "stroke">> & {
  fill?: {
    enabled: boolean;
    color: string;
  };
  stroke?: {
    enabled: boolean;
    color: string;
    width: number;
  };
} & Drawable<Graphics, { radius: number }>;

export const CIRCLE_COMPONENT: ComponentInstanceManage<
  "CircleComponent",
  CircleComponentData,
  CircleComponent
> = {
  name: "CircleComponent",
  create: (data: CircleComponentData): CircleComponent => {
    const beforeDrawable = {
      radius: data.radius,
      position: data.position ?? { x: 0, y: 0 },
      scale: data.scale ?? { x: 1, y: 1 },
      rotation: data.rotation ?? 0,
      alpha: data.alpha ?? 1,
      visible: data.visible ?? true,
      fill: data.fill,
      stroke: data.stroke,
      _resource: { radius: data.radius },
      _drawable: null as null | Container,
    };

    const graphics = new Graphics();

    // Draw circle centered at origin
    graphics.circle(0, 0, beforeDrawable.radius);

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
    return beforeDrawable as CircleComponent;
  },
  serialize: ({
    _resource,
    _drawable,
    ...component
  }: CircleComponent): ComponentSerialized<"CircleComponent", CircleComponentData> => ({
    name: "CircleComponent",
    data: {
      ...component,
    },
  }),
};
