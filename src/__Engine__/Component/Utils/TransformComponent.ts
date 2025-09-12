import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";

export interface TransformComponentData {
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: number;
}

export interface TransformComponent {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
}

export const TRANSFORM_COMPONENT: ComponentInstanceManage<
  "TransformComponent",
  TransformComponentData,
  TransformComponent
> = {
  name: "TransformComponent",
  create: (data: TransformComponentData): TransformComponent => ({
    position: data.position ?? { x: 0, y: 0 },
    scale: data.scale ?? { x: 1, y: 1 },
    rotation: data.rotation ?? 0,
  }),
  serialize: (
    component: TransformComponent,
  ): ComponentSerialized<"TransformComponent", TransformComponentData> => ({
    name: "TransformComponent",
    data: {
      position: component.position,
      scale: component.scale,
      rotation: component.rotation,
    },
  }),
};
