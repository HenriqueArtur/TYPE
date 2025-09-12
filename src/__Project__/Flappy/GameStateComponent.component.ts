import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface GameStateComponentData {
  isPaused?: boolean;
}

export interface GameStateComponent {
  isPaused: boolean;
}

export default {
  name: "GameStateComponent",
  create: (data: GameStateComponentData): GameStateComponent => ({
    isPaused: data.isPaused ?? false,
  }),
  serialize: (
    component: GameStateComponent,
  ): ComponentSerialized<"GameStateComponent", GameStateComponentData> => ({
    name: "GameStateComponent",
    data: {
      isPaused: component.isPaused,
    },
  }),
} as ComponentInstanceManage<"GameStateComponent", GameStateComponentData, GameStateComponent>;
