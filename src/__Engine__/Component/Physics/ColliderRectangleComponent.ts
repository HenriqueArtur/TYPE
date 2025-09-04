import { Bodies, type Body } from "matter-js";

export interface ColliderRectangleComponent {
  _body: Body;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  frictionStatic: number;
}

export interface ColliderRectangleComponentOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  frictionStatic?: number;
}

export function createColliderRectangleComponent(
  options: ColliderRectangleComponentOptions,
): ColliderRectangleComponent {
  return {
    _body: Bodies.rectangle(options.x, options.y, options.width, options.height, {
      isStatic: true,
      frictionStatic: options.frictionStatic ?? 0.001,
    }),
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    rotation: options.rotation ?? 0,
    frictionStatic: options.frictionStatic ?? 0.001,
  };
}
