export interface ComponentInstanceManage<DataSerialized, Component> {
  create: (data: DataSerialized) => Component;
  serialize: (component: Component) => DataSerialized;
}
