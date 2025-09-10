import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface BirdControlComponentData {
  gravity: number;
  jumpForce: number;
  velocity: { x: number; y: number };
}

export interface BirdControlComponent {
  gravity: number;
  jumpForce: number;
  velocity: { x: number; y: number };
}

export default {
  name: "BirdControlComponent",
  create: (data: BirdControlComponentData): BirdControlComponent => ({
    gravity: data.gravity,
    jumpForce: data.jumpForce,
    velocity: { ...data.velocity },
  }),
  serialize: (
    component: BirdControlComponent,
  ): ComponentSerialized<"BirdControlComponent", BirdControlComponentData> => ({
    name: "BirdControlComponent",
    data: {
      gravity: component.gravity,
      jumpForce: component.jumpForce,
      velocity: component.velocity,
    },
  }),
} as ComponentInstanceManage<
  "BirdControlComponent",
  BirdControlComponentData,
  BirdControlComponent
>;
