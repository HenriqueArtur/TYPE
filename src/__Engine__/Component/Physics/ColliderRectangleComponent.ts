import { Bodies } from "matter-js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { BodyComponent } from "./__type__";

export interface ColliderRectangleComponentData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  frictionStatic?: number;
}

export type ColliderRectangleComponent = Required<ColliderRectangleComponentData> & BodyComponent;

export const COLLIDER_RECTANGLE_COMPONENT: ComponentInstanceManage<
  "ColliderRectangleComponent",
  ColliderRectangleComponentData,
  ColliderRectangleComponent
> = {
  name: "ColliderRectangleComponent",
  create: (data: ColliderRectangleComponentData): ColliderRectangleComponent => {
    return {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      rotation: data.rotation ?? 0,
      frictionStatic: data.frictionStatic ?? 0.001,
      _body: Bodies.rectangle(data.x, data.y, data.width, data.height, {
        isStatic: true,
        frictionStatic: data.frictionStatic ?? 0.001,
      }),
    };
  },
  serialize: ({
    _body,
    ...component
  }: ColliderRectangleComponent): ComponentSerialized<
    "ColliderRectangleComponent",
    ColliderRectangleComponentData
  > => ({
    name: "ColliderRectangleComponent",
    data: {
      ...component,
    },
  }),
};
