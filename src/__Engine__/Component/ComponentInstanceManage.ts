export interface ComponentInstanceManage<Name extends string, DataSerialized, Component> {
  name: Name;
  create: (data: DataSerialized) => Component;
  serialize: (component: Component) => ComponentSerialized<Name, DataSerialized>;
}

export interface ComponentSerialized<Name extends string, T = unknown> {
  name: Name;
  data: T;
}
