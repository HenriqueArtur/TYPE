import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface GameStateComponentData {
  isGameOver: boolean;
  isPaused: boolean;
}

export interface GameStateComponent {
  isGameOver: boolean;
  isPaused: boolean;
}

export default {
  name: "GameStateComponent",
  create: (data: GameStateComponentData): GameStateComponent => ({
    isGameOver: data.isGameOver,
    isPaused: data.isPaused,
  }),
  serialize: (
    component: GameStateComponent,
  ): ComponentSerialized<"GameStateComponent", GameStateComponentData> => ({
    name: "GameStateComponent",
    data: {
      isGameOver: component.isGameOver,
      isPaused: component.isPaused,
    },
  }),
} as ComponentInstanceManage<"GameStateComponent", GameStateComponentData, GameStateComponent>;
