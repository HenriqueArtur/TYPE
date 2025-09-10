import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

type ExampleComponentSerialized = {
  hp: number;
};

type ExampleComponent = ExampleComponentSerialized;

const ExampleComponentInstance: ComponentInstanceManage<
  "ExampleComponent",
  ExampleComponentSerialized,
  ExampleComponent
> = {
  name: "ExampleComponent",
  create: (data: ExampleComponentSerialized): ExampleComponentSerialized => data,
  serialize: (
    component: ExampleComponentSerialized,
  ): ComponentSerialized<"ExampleComponent", ExampleComponentSerialized> => ({
    name: "ExampleComponent",
    data: component,
  }),
};

export default ExampleComponentInstance;
