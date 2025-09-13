import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface GameStateComponentData {
  isPaused?: boolean;
  timeToNextJump?: number;
  timeToJump?: number;
}

export interface GameStateComponent {
  isPaused: boolean;
  timeToNextJump: number;
  timeToJump: number;
}

export default {
  name: "GameStateComponent",
  create: (data: GameStateComponentData): GameStateComponent => ({
    isPaused: data.isPaused ?? false,
    timeToNextJump: 0,
    timeToJump: 300,
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
