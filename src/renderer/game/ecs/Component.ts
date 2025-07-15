import type { Entity } from "./Entity";

export abstract class Component {
  static readonly type: string;
  public entity!: Entity;

  public get type(): string {
    return Object.getPrototypeOf(this).constructor.type;
  }
}

export type ComponentClass<T extends Component> = (new (
  data: Record<string, unknown>,
) => T) & {
  type: string;
};
