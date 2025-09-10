import { Bodies } from "matter-js";
import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";
import type { BodyComponent } from "./__type__";

export interface SensorCircleComponentData {
  x: number;
  y: number;
  radius: number;
  rotation?: number;
}

export type SensorCircleComponent = Required<SensorCircleComponentData> & BodyComponent;

export const SENSOR_CIRCLE_COMPONENT: ComponentInstanceManage<
  "SensorCircleComponent",
  SensorCircleComponentData,
  SensorCircleComponent
> = {
  name: "SensorCircleComponent",
  create: (data: SensorCircleComponentData): SensorCircleComponent => {
    return {
      x: data.x,
      y: data.y,
      radius: data.radius,
      rotation: data.rotation ?? 0,
      _body: Bodies.circle(data.x, data.y, data.radius, {
        isStatic: true,
        isSensor: true,
      }),
    };
  },
  serialize: ({
    _body,
    ...component
  }: SensorCircleComponent): ComponentSerialized<
    "SensorCircleComponent",
    SensorCircleComponentData
  > => ({
    name: "SensorCircleComponent",
    data: {
      ...component,
    },
  }),
};
