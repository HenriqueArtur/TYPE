import type { EventBus } from "../EventBus";

export interface EventHandlerData {
  [eventName: string]: (...args: unknown[]) => void;
}

export interface EventHandlerComponentData {
  handlers?: EventHandlerData;
}

/**
 * EventHandlerComponent - Component for handling events in ECS entities
 *
 * Allows entities to register event handlers and automatically manage
 * event subscriptions through the EventBus system.
 */
export class EventHandlerComponent {
  private handlers: EventHandlerData;
  private unsubscribeFunctions: Map<string, () => void>;
  private eventBus: EventBus | null = null;

  constructor(data?: EventHandlerComponentData) {
    this.handlers = data?.handlers ?? {};
    this.unsubscribeFunctions = new Map();
  }

  /**
   * Initialize the component with an EventBus instance
   * This should be called after the component is created
   * @param eventBus - The EventBus instance to use for subscriptions
   */
  init(eventBus: EventBus): void {
    this.eventBus = eventBus;
    this.subscribeToEvents();
  }

  /**
   * Add a new event handler for the specified event
   * @param eventName - Name of the event to listen for
   * @param handler - Function to call when event is triggered
   */
  addHandler(eventName: string, handler: (...args: unknown[]) => void): void {
    this.handlers[eventName] = handler;

    // If we're already connected to EventBus, subscribe immediately
    if (this.eventBus) {
      this.subscribeToEvent(eventName, handler);
    }
  }

  /**
   * Remove an event handler
   * @param eventName - Name of the event to stop listening for
   */
  removeHandler(eventName: string): void {
    if (this.handlers[eventName]) {
      delete this.handlers[eventName];

      // Unsubscribe from EventBus if connected
      const unsubscribe = this.unsubscribeFunctions.get(eventName);
      if (unsubscribe) {
        unsubscribe();
        this.unsubscribeFunctions.delete(eventName);
      }
    }
  }

  /**
   * Get all registered event handler names
   * @returns Array of event names this component listens to
   */
  getHandledEvents(): string[] {
    return Object.keys(this.handlers);
  }

  /**
   * Check if the component handles a specific event
   * @param eventName - Name of the event to check
   * @returns True if this component handles the event
   */
  hasHandler(eventName: string): boolean {
    return eventName in this.handlers;
  }

  /**
   * Get the handler function for a specific event
   * @param eventName - Name of the event
   * @returns The handler function or undefined if not found
   */
  getHandler(eventName: string): ((...args: unknown[]) => void) | undefined {
    return this.handlers[eventName];
  }

  /**
   * Update all handlers with new data
   * @param newHandlers - New event handler data
   */
  setHandlers(newHandlers: EventHandlerData): void {
    // Unsubscribe from all current handlers
    this.unsubscribeFromAllEvents();

    // Set new handlers
    this.handlers = { ...newHandlers };

    // Resubscribe with new handlers
    if (this.eventBus) {
      this.subscribeToEvents();
    }
  }

  /**
   * Get a copy of all current handlers
   * @returns Copy of the handlers object
   */
  getHandlers(): EventHandlerData {
    return { ...this.handlers };
  }

  private subscribeToEvents(): void {
    if (!this.eventBus) {
      return;
    }

    for (const [eventName, handler] of Object.entries(this.handlers)) {
      this.subscribeToEvent(eventName, handler);
    }
  }

  private subscribeToEvent(eventName: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventBus) {
      return;
    }

    // Unsubscribe from existing subscription if any
    const existingUnsubscribe = this.unsubscribeFunctions.get(eventName);
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    // Subscribe to new event
    const unsubscribe = this.eventBus.on(eventName, handler);
    this.unsubscribeFunctions.set(eventName, unsubscribe);
  }

  private unsubscribeFromAllEvents(): void {
    for (const unsubscribe of this.unsubscribeFunctions.values()) {
      unsubscribe();
    }
    this.unsubscribeFunctions.clear();
  }

  destroy(): void {
    this.unsubscribeFromAllEvents();
    this.handlers = {};
    this.eventBus = null;
  }

  static jsonToGameObject(json: string | object): EventHandlerComponent {
    const data: EventHandlerComponentData = typeof json === "string" ? JSON.parse(json) : json;
    return new EventHandlerComponent(data);
  }
}
