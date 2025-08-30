import type { EventEngine } from "./EventEngine";

/**
 * RemoveEventHandler - Handles cleanup events for components, entities, and systems
 *
 * Listens for removal events and triggers appropriate cleanup actions.
 * Currently handles component removal with special handling for drawable components.
 */
export class RemoveEventHandler {
  private eventEngine: EventEngine;
  private boundHandleComponentRemoved: (
    entityId: string,
    componentName: string,
    componentData: unknown,
  ) => void;

  constructor(eventEngine: EventEngine) {
    this.eventEngine = eventEngine;
    this.boundHandleComponentRemoved = this.handleComponentRemoved.bind(this);
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for removal events
   */
  private setupEventListeners(): void {
    // Listen for component removal events
    this.eventEngine.on("component:removed", this.boundHandleComponentRemoved);
  }

  /**
   * Handle component removal events
   * @param entityId - ID of the entity the component was removed from
   * @param componentName - Name of the removed component
   * @param componentData - Data of the removed component
   */
  private handleComponentRemoved(
    entityId: string,
    componentName: string,
    componentData: unknown,
  ): void {
    // Check if the removed component is a sprite (drawable component)
    if (componentName === "SpriteComponent") {
      // Emit remove:drawable event for cleanup of drawable resources
      this.eventEngine.emit("remove:drawable", {
        entityId,
        componentName,
        componentData,
      });
    }

    // Future expansion: Handle other component types
    // if (componentName === "BodyComponent") {
    //   this.eventEngine.emit("remove:physics", { entityId, componentName, componentData });
    // }

    // if (componentName === "AudioComponent") {
    //   this.eventEngine.emit("remove:audio", { entityId, componentName, componentData });
    // }
  }

  /**
   * Clean up event listeners
   * Should be called when the handler is no longer needed
   */
  destroy(): void {
    this.eventEngine.off("component:removed", this.boundHandleComponentRemoved);
  }
}
