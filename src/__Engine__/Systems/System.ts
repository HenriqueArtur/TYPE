/**
 * System interface for Entity Component System (ECS) architecture
 *
 * Defines the contract for systems that operate on entities and components.
 * Systems contain the game logic and operate on entities that have specific components.
 *
 * @template TEngine - The type of engine instance passed to system methods
 */
export interface System<TEngine = unknown> {
  /** Priority determines the order of system execution (lower values execute first) */
  priority: number;

  /** Whether the system is currently enabled and should be updated */
  enabled: boolean;

  /**
   * Called once when the system is added to the engine
   * Use this for system initialization, resource allocation, etc.
   * @param engine - The engine instance
   */
  init(engine: TEngine): void | Promise<void>;

  /**
   * Called every frame to update the system's logic
   * This is where the main system logic should be implemented
   * @param engine - The engine instance
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  update(engine: TEngine, deltaTime: number): void;

  /**
   * Optional cleanup method called when the system is removed from the engine
   * Use this for resource cleanup, event unsubscription, etc.
   * @param engine - The engine instance
   */
  destroy?(engine: TEngine): void;
}

export type SystemName = string;
