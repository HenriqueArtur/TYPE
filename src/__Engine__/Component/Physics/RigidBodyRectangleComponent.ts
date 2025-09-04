import { Bodies, type Body } from "matter-js";

export interface RigidBodyRectangleComponent {
  _body: Body;
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: { x: number; y: number };
  angularVelocity: number;
  rotation: number;
  restitution: number;
  friction: number;
  frictionAir: number;
  density: number;
}

export interface RigidBodyRectangleComponentOptions {
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

export function createRigidBodyRectangleComponent(
  options: RigidBodyRectangleComponentOptions,
): RigidBodyRectangleComponent {
  return {
    _body: Bodies.rectangle(options.x, options.y, options.width, options.height, {
      isStatic: false,
      restitution: options.restitution ?? 0.8,
      friction: options.friction ?? 0.001,
      frictionAir: options.frictionAir ?? 0.01,
      density: options.density ?? 0.001,
    }),
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    velocity: options.velocity ?? { x: 0, y: 0 },
    angularVelocity: options.angularVelocity ?? 0,
    rotation: options.rotation ?? 0,
    restitution: options.restitution ?? 0.8,
    friction: options.friction ?? 0.001,
    frictionAir: options.frictionAir ?? 0.01,
    density: options.density ?? 0.001,
  };
}
