import { Bodies } from "matter-js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { BodyComponent } from "./__type__";

export interface RigidBodyRectangleComponentData {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity?: { x: number; y: number };
  angularVelocity?: number;
  rotation?: number;
  restitution?: number;
  friction?: number;
  frictionAir?: number;
  density?: number;
}

export type RigidBodyRectangleComponent = Required<
  Omit<
    RigidBodyRectangleComponentData,
    | "velocity"
    | "angularVelocity"
    | "rotation"
    | "restitution"
    | "friction"
    | "frictionAir"
    | "density"
  >
> & {
  velocity: { x: number; y: number };
  angularVelocity: number;
  rotation: number;
  restitution: number;
  friction: number;
  frictionAir: number;
  density: number;
} & BodyComponent;

export const RIGID_BODY_RECTANGLE_COMPONENT: ComponentInstanceManage<
  "RigidBodyRectangleComponent",
  RigidBodyRectangleComponentData,
  RigidBodyRectangleComponent
> = {
  name: "RigidBodyRectangleComponent",
  create: (data: RigidBodyRectangleComponentData): RigidBodyRectangleComponent => {
    return {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      velocity: data.velocity ?? { x: 0, y: 0 },
      angularVelocity: data.angularVelocity ?? 0,
      rotation: data.rotation ?? 0,
      restitution: data.restitution ?? 0.8,
      friction: data.friction ?? 0.001,
      frictionAir: data.frictionAir ?? 0.01,
      density: data.density ?? 0.001,
      _body: Bodies.rectangle(data.x, data.y, data.width, data.height, {
        isStatic: false,
        restitution: data.restitution ?? 0.8,
        friction: data.friction ?? 0.001,
        frictionAir: data.frictionAir ?? 0.01,
        density: data.density ?? 0.001,
      }),
    };
  },
  serialize: ({
    _body,
    ...component
  }: RigidBodyRectangleComponent): ComponentSerialized<
    "RigidBodyRectangleComponent",
    RigidBodyRectangleComponentData
  > => ({
    name: "RigidBodyRectangleComponent",
    data: {
      ...component,
    },
  }),
};
