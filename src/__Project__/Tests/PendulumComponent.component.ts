import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface PendulumComponentData {
  time?: number;
  amplitude: number;
  frequency: number;
  baseX: number;
}

export interface PendulumComponent {
  time: number;
  amplitude: number;
  frequency: number;
  baseX: number;
}

export default {
  name: "PendulumComponent",
  create: (data: PendulumComponentData): PendulumComponent => ({
    time: data.time ?? 0,
    amplitude: data.amplitude,
    frequency: data.frequency,
    baseX: data.baseX,
  }),
  serialize: (
    component: PendulumComponent,
  ): ComponentSerialized<"PendulumComponent", PendulumComponentData> => ({
    name: "PendulumComponent",
    data: {
      time: component.time,
      amplitude: component.amplitude,
      frequency: component.frequency,
      baseX: component.baseX,
    },
  }),
} as ComponentInstanceManage<"PendulumComponent", PendulumComponentData, PendulumComponent>;
