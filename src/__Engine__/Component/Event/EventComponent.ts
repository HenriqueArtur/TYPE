import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";

export interface EventComponentData {
  scriptPath: string;
}

export interface EventComponent {
  scriptPath: string;
}

export const EVENT_COMPONENT: ComponentInstanceManage<
  "EventComponent",
  EventComponentData,
  EventComponent
> = {
  name: "EventComponent",
  create: (data: EventComponentData): EventComponent => {
    return {
      scriptPath: data.scriptPath,
    };
  },
  serialize: (
    component: EventComponent,
  ): ComponentSerialized<"EventComponent", EventComponentData> => ({
    name: "EventComponent",
    data: {
      scriptPath: component.scriptPath,
    },
  }),
};
