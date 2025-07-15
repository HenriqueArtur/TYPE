import type { Component, ComponentClass } from "./Component";

export class Entity {
  private components: Map<string, Component> = new Map();
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  public addComponent<T extends Component>(component: T): T {
    component.entity = this;
    this.components.set(component.type, component);
    return component;
  }

  public getComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined {
    return this.components.get(componentClass.type) as T;
  }

  public hasComponent<T extends Component>(componentClass: ComponentClass<T>): boolean {
    return this.components.has(componentClass.type);
  }

  public removeComponent<T extends Component>(componentClass: ComponentClass<T>): void {
    this.components.delete(componentClass.type);
  }
}
