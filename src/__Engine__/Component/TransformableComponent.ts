export abstract class GameComponent {
  static readonly _type: string;
  static readonly prefix: string;
  abstract readonly type: string;
  static jsonToGameObject: (json: string | object) => GameComponent;
}

export interface TransformableComponent {
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
}

export interface TransformComponentData {
  position?: { x: number; y: number };
  rotation?: number;
  scale?: { x: number; y: number };
}

export class TransformComponent extends GameComponent implements TransformableComponent {
  static readonly _type = "TransformComponent";
  static readonly prefix = "TRANS";
  readonly type = "TransformComponent";

  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };

  constructor(data: TransformComponentData = {}) {
    super();
    this.position = data.position || { x: 0, y: 0 };
    this.rotation = data.rotation || 0;
    this.scale = data.scale || { x: 1, y: 1 };
  }

  static jsonToGameObject = (data: string | object): TransformComponent => {
    if (typeof data === "string") {
      return new TransformComponent(JSON.parse(data));
    }
    return new TransformComponent(data as TransformComponentData);
  };
}
