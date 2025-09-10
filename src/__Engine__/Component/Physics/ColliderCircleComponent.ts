import { Bodies } from "matter-js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { BodyComponent } from "./__type__";

export interface ColliderCircleComponentData {
  x: number;
  y: number;
  radius: number;
  rotation?: number;
  frictionStatic?: number;
}

export type ColliderCircleComponent = Required<ColliderCircleComponentData> & BodyComponent;

export const COLLIDER_CIRCLE_COMPONENT: ComponentInstanceManage<
  "ColliderCircleComponent",
  ColliderCircleComponentData,
  ColliderCircleComponent
> = {
  name: "ColliderCircleComponent",
  create: (data: ColliderCircleComponentData): ColliderCircleComponent => {
    return {
      x: data.x,
      y: data.y,
      radius: data.radius,
      rotation: data.rotation ?? 0,
      frictionStatic: data.frictionStatic ?? 0.001,
      _body: Bodies.circle(data.x, data.y, data.radius, {
        isStatic: true,
        frictionStatic: data.frictionStatic ?? 0.001,
      }),
    };
  },
  serialize: ({
    _body,
    ...component
  }: ColliderCircleComponent): ComponentSerialized<
    "ColliderCircleComponent",
    ColliderCircleComponentData
  > => ({
    name: "ColliderCircleComponent",
    data: {
      ...component,
    },
  }),
};
