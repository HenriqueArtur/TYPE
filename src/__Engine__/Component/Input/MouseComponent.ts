import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";

export interface MouseComponentData {
  screenPosition?: { x: number; y: number };
  windowPosition?: { x: number; y: number };
  buttons?: {
    left: boolean;
    right: boolean;
    middle: boolean;
  };
  wheel?: {
    deltaX: number;
    deltaY: number;
    deltaZ: number;
  };
}

export type MouseComponent = Required<MouseComponentData>;

export const MOUSE_COMPONENT: ComponentInstanceManage<
  "MouseComponent",
  MouseComponentData,
  MouseComponent
> = {
  name: "MouseComponent",
  create: (data: MouseComponentData): MouseComponent => ({
    screenPosition: data.screenPosition ?? { x: 0, y: 0 },
    windowPosition: data.windowPosition ?? { x: 0, y: 0 },
    buttons: data.buttons ?? {
      left: false,
      right: false,
      middle: false,
    },
    wheel: data.wheel ?? {
      deltaX: 0,
      deltaY: 0,
      deltaZ: 0,
    },
  }),
  serialize: (
    component: MouseComponent,
  ): ComponentSerialized<"MouseComponent", MouseComponentData> => ({
    name: "MouseComponent",
    data: {
      screenPosition: component.screenPosition,
      windowPosition: component.windowPosition,
      buttons: component.buttons,
      wheel: component.wheel,
    },
  }),
};
