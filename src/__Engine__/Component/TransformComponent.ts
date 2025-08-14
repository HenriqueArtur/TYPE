import { Angle } from "../Utils/Angle";
import type { GameComponent } from ".";

export interface TransformComponentData {
  position?: {
    x?: number;
    y?: number;
  };
  scale?: {
    x?: number;
    y?: number;
  };
  rotation?: Angle;
}

export class TransformComponent implements GameComponent {
  static readonly _type = "TransformComponent";
  readonly type = TransformComponent._type;
  static readonly prefix = "TR";

  private position: {
    x: number;
    y: number;
  };
  private scale: {
    x: number;
    y: number;
  };
  private rotation: Angle;

  constructor(data?: TransformComponentData) {
    this.position = {
      x: data?.position?.x ?? 0,
      y: data?.position?.y ?? 0,
    };
    this.scale = {
      x: data?.scale?.x ?? 1,
      y: data?.scale?.y ?? 1,
    };
    this.rotation = data?.rotation ?? Angle.fromDegrees(0);
  }

  set(data: Omit<TransformComponentData, "id">) {
    if (data.position) {
      if (data.position.x) {
        this.position.x = data.position.x;
      }
      if (data.position.y) {
        this.position.y = data.position.y;
      }
    }
    if (data.scale) {
      if (data.scale.x) {
        this.scale.x = data.scale.x;
      }
      if (data.scale.y) {
        this.scale.y = data.scale.y;
      }
    }
    if (data.rotation) {
      this.rotation = data.rotation;
    }
  }

  value() {
    return {
      position: { ...this.position },
      scale: { ...this.scale },
      rotation: this.rotation,
    };
  }

  static jsonToGameObject(json: string | object): TransformComponent {
    const data: TransformComponentData = typeof json === "string" ? JSON.parse(json) : json;
    return new TransformComponent(data);
  }
}
