import type { Body } from "matter-js";
import type { GameComponent } from ".";

/**
 * Interface for components that handle physics simulation (bodies, collision)
 */
export interface PhysicsComponent extends GameComponent {
  readonly type: string;

  /**
   * Get the physics body for simulation
   */
  getBody(): Body;

  /**
   * Set position in physics world
   */
  setPosition(x: number, y: number): void;

  /**
   * Get position from physics body
   */
  getPosition(): { x: number; y: number };

  /**
   * Set rotation in physics world
   */
  setRotation(angle: number): void;

  /**
   * Get rotation from physics body
   */
  getRotation(): number;

  /**
   * Apply force to the body
   */
  applyForce(force: { x: number; y: number }, point?: { x: number; y: number }): void;

  /**
   * Set velocity
   */
  setVelocity(velocity: { x: number; y: number }): void;

  /**
   * Get velocity
   */
  getVelocity(): { x: number; y: number };

  /**
   * Check if body is static
   */
  isStatic(): boolean;

  /**
   * Set static state
   */
  setStatic(isStatic: boolean): void;
}
