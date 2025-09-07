import type { ComponentInstanceManage } from "../__Engine__/Component/ComponentInstanceManage";

type ExampleComponentSerialized = {
  hp: number;
};

type ExampleComponent = ExampleComponentSerialized;

const ExampleComponentInstance: ComponentInstanceManage<
  ExampleComponentSerialized,
  ExampleComponent
> = {
  create: (data: ExampleComponentSerialized): ExampleComponentSerialized => data,
  serialize: (component: ExampleComponentSerialized): ExampleComponentSerialized => component,
};

export default ExampleComponentInstance;
