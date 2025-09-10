import type { ComponentInstanceManage, ComponentSerialized } from "../ComponentInstanceManage";

export interface OnCollisionEventComponentData {
  scriptPath: string;
}

export interface OnCollisionEventComponent {
  scriptPath: string;
}

export const ON_COLLISION_EVENT_COMPONENT: ComponentInstanceManage<
  "OnCollisionEventComponent",
  OnCollisionEventComponentData,
  OnCollisionEventComponent
> = {
  name: "OnCollisionEventComponent",
  create: (data: OnCollisionEventComponentData): OnCollisionEventComponent => {
    return {
      scriptPath: data.scriptPath,
    };
  },
  serialize: (
    component: OnCollisionEventComponent,
  ): ComponentSerialized<"OnCollisionEventComponent", OnCollisionEventComponentData> => ({
    name: "OnCollisionEventComponent",
    data: {
      scriptPath: component.scriptPath,
    },
  }),
};
