import type { GameComponent } from ".";

/**
 * Interface for components that handle transformation (position, rotation, scale)
 */
export interface TransformableComponent extends GameComponent {
  readonly type: string;

  /**
   * Get the current transformation values
   */
  getTransform(): {
    position: { x: number; y: number };
    rotation: number;
    scale: { x: number; y: number };
  };

  /**
   * Set transformation values
   */
  setTransform(data: {
    position?: { x?: number; y?: number };
    rotation?: number;
    scale?: { x?: number; y?: number };
  }): void;

  /**
   * Get position
   */
  getPosition(): { x: number; y: number };

  /**
   * Set position
   */
  setPosition(x: number, y: number): void;

  /**
   * Get rotation in degrees
   */
  getRotation(): number;

  /**
   * Set rotation in degrees
   */
  setRotation(degrees: number): void;

  /**
   * Get scale
   */
  getScale(): { x: number; y: number };

  /**
   * Set scale
   */
  setScale(x: number, y: number): void;
}
