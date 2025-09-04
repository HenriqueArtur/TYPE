import { Bodies, type Body } from "matter-js";

export interface SensorRectangleComponent {
  _body: Body;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface SensorRectangleComponentOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export function createSensorRectangleComponent(
  options: SensorRectangleComponentOptions,
): SensorRectangleComponent {
  return {
    _body: Bodies.rectangle(options.x, options.y, options.width, options.height, {
      isStatic: true,
      isSensor: true,
    }),
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    rotation: options.rotation ?? 0,
  };
}
