import { Angle } from "../../Utils/Angle";
import type { TransformableComponent } from "../TransformableComponent";

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

export class TransformComponent implements TransformableComponent {
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

  // TransformableComponent interface implementation
  getTransform(): {
    position: { x: number; y: number };
    rotation: number;
    scale: { x: number; y: number };
  } {
    return {
      position: { ...this.position },
      rotation: this.rotation.degrees,
      scale: { ...this.scale },
    };
  }

  setTransform(data: {
    position?: { x?: number; y?: number };
    rotation?: number;
    scale?: { x?: number; y?: number };
  }): void {
    if (data.position) {
      if (data.position.x !== undefined) {
        this.position.x = data.position.x;
      }
      if (data.position.y !== undefined) {
        this.position.y = data.position.y;
      }
    }
    if (data.scale) {
      if (data.scale.x !== undefined) {
        this.scale.x = data.scale.x;
      }
      if (data.scale.y !== undefined) {
        this.scale.y = data.scale.y;
      }
    }
    if (data.rotation !== undefined) {
      this.rotation = Angle.fromDegrees(data.rotation);
    }
  }

  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }

  getRotation(): number {
    return this.rotation.degrees;
  }

  setRotation(degrees: number): void {
    this.rotation = Angle.fromDegrees(degrees);
  }

  getScale(): { x: number; y: number } {
    return { ...this.scale };
  }

  setScale(x: number, y: number): void {
    this.scale.x = x;
    this.scale.y = y;
  }

  destroy(): void {
    // Reset to default values
    this.position.x = 0;
    this.position.y = 0;
    this.scale.x = 1;
    this.scale.y = 1;
    this.rotation = Angle.fromDegrees(0);
  }

  static jsonToGameObject(json: string | object): TransformComponent {
    const data: TransformComponentData = typeof json === "string" ? JSON.parse(json) : json;
    return new TransformComponent(data);
  }
}
