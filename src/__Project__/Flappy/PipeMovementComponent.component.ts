import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface PipeMovementComponentData {
  speed: number;
}

export interface PipeMovementComponent {
  speed: number;
}

export default {
  name: "PipeMovementComponent",
  create: (data: PipeMovementComponentData): PipeMovementComponent => ({
    speed: data.speed,
  }),
  serialize: (
    component: PipeMovementComponent,
  ): ComponentSerialized<"PipeMovementComponent", PipeMovementComponentData> => ({
    name: "PipeMovementComponent",
    data: {
      speed: component.speed,
    },
  }),
} as ComponentInstanceManage<
  "PipeMovementComponent",
  PipeMovementComponentData,
  PipeMovementComponent
>;
