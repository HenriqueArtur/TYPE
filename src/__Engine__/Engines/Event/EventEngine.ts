/**
 * EventEngine - Centralized event management system for the game engine
 *
 * Provides a decoupled way for systems, components, and other parts of the engine
 * to communicate through events without direct dependencies.
 * Uses dependency injection pattern instead of singleton for better testability.
 */
export class EventEngine {
  private listeners: Map<string, Set<(...args: unknown[]) => void>>;
  private eventQueue: Array<{ eventName: string; args: unknown[] }>;

  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
  }

  // ========================================
  // EVENT SUBSCRIPTION
  // ========================================

  /**
   * Subscribe to an event
   * @param eventName - Name of the event to listen for
   * @param callback - Function to call when event is triggered
   * @returns Unsubscribe function
   */
  on<T extends unknown[]>(eventName: string, callback: (...args: T) => void): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.add(callback as (...args: unknown[]) => void);

      // Return unsubscribe function
      return () => {
        eventListeners.delete(callback as (...args: unknown[]) => void);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventName);
        }
      };
    }

    // Return empty unsubscribe function if no event listeners exist
    return () => {};
  }

  /**
   * Subscribe to an event that will only be triggered once
   * @param eventName - Name of the event to listen for
   * @param callback - Function to call when event is triggered
   * @returns Unsubscribe function
   */
  once<T extends unknown[]>(eventName: string, callback: (...args: T) => void): () => void {
    const unsubscribe = this.on(eventName, (...args: T) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }

  /**
   * Unsubscribe from an event
   * @param eventName - Name of the event
   * @param callback - The callback function to remove
   */
  off<T extends unknown[]>(eventName: string, callback: (...args: T) => void): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback as (...args: unknown[]) => void);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Remove all listeners for a specific event
   * @param eventName - Name of the event to clear
   */
  removeAllListeners(eventName: string): void {
    this.listeners.delete(eventName);
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.listeners.clear();
    this.eventQueue.length = 0;
  }

  // ========================================
  // EVENT EMISSION
  // ========================================

  /**
   * Add an event to the queue to be processed during the next processEvents() call
   * This is the default behavior for game engines to maintain proper timing control
   * @param eventName - Name of the event to emit
   * @param args - Arguments to pass to listeners
   */
  emit<T extends unknown[]>(eventName: string, ...args: T): void {
    this.eventQueue.push({ eventName, args: args as unknown[] });
  }

  /**
   * Emit an event immediately to all listeners (bypasses the queue)
   * Use sparingly - only for events that must be processed synchronously
   * @param eventName - Name of the event to emit immediately
   * @param args - Arguments to pass to listeners
   */
  emitImmediate<T extends unknown[]>(eventName: string, ...args: T): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      // Create a copy to avoid issues if listeners modify the set during iteration
      const listenersCopy = Array.from(eventListeners);
      for (const listener of listenersCopy) {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for "${eventName}":`, error);
        }
      }
    }
  }

  /**
   * Process all queued events
   * This should be called at appropriate times in the game loop
   * Handles events that are emitted during processing
   */
  processEvents(): void {
    while (this.eventQueue.length > 0) {
      const eventsToProcess = [...this.eventQueue];
      this.eventQueue.length = 0;

      for (const event of eventsToProcess) {
        this.emitImmediate(event.eventName, ...event.args);
      }
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get the number of listeners for a specific event
   * @param eventName - Name of the event
   * @returns Number of listeners
   */
  getListenerCount(eventName: string): number {
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Get all registered event names
   * @returns Array of event names
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if there are any listeners for a specific event
   * @param eventName - Name of the event to check
   * @returns True if there are listeners, false otherwise
   */
  hasListeners(eventName: string): boolean {
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? eventListeners.size > 0 : false;
  }
}
