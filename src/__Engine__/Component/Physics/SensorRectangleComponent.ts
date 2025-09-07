import { Bodies } from "matter-js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { BodyComponent } from "./__type__";

export interface SensorRectangleComponentData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export type SensorRectangleComponent = Required<SensorRectangleComponentData> & BodyComponent;

export const SENSOR_RECTANGLE_COMPONENT: ComponentInstanceManage<
  "SensorRectangleComponent",
  SensorRectangleComponentData,
  SensorRectangleComponent
> = {
  name: "SensorRectangleComponent",
  create: (data: SensorRectangleComponentData): SensorRectangleComponent => {
    return {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      rotation: data.rotation ?? 0,
      _body: Bodies.rectangle(data.x, data.y, data.width, data.height, {
        isStatic: true,
        isSensor: true,
      }),
    };
  },
  serialize: ({
    _body,
    ...component
  }: SensorRectangleComponent): ComponentSerialized<
    "SensorRectangleComponent",
    SensorRectangleComponentData
  > => ({
    name: "SensorRectangleComponent",
    data: {
      ...component,
    },
  }),
};
