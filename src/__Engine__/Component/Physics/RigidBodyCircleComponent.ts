import { Bodies } from "matter-js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { BodyComponent } from "./__type__";

export interface RigidBodyCircleComponentData {
  x: number;
  y: number;
  radius: number;
  velocity?: { x: number; y: number };
  angularVelocity?: number;
  rotation?: number;
  restitution?: number;
  friction?: number;
  frictionAir?: number;
  density?: number;
}

export type RigidBodyCircleComponent = Required<
  Omit<
    RigidBodyCircleComponentData,
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

export const RIGID_BODY_CIRCLE_COMPONENT: ComponentInstanceManage<
  "RigidBodyCircleComponent",
  RigidBodyCircleComponentData,
  RigidBodyCircleComponent
> = {
  name: "RigidBodyCircleComponent",
  create: (data: RigidBodyCircleComponentData): RigidBodyCircleComponent => {
    return {
      x: data.x,
      y: data.y,
      radius: data.radius,
      velocity: data.velocity ?? { x: 0, y: 0 },
      angularVelocity: data.angularVelocity ?? 0,
      rotation: data.rotation ?? 0,
      restitution: data.restitution ?? 0.8,
      friction: data.friction ?? 0.001,
      frictionAir: data.frictionAir ?? 0.01,
      density: data.density ?? 0.001,
      _body: Bodies.circle(data.x, data.y, data.radius, {
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
  }: RigidBodyCircleComponent): ComponentSerialized<
    "RigidBodyCircleComponent",
    RigidBodyCircleComponentData
  > => ({
    name: "RigidBodyCircleComponent",
    data: {
      ...component,
    },
  }),
};
