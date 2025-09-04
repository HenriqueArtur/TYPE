import { generateId } from "../../Utils/id";
import type { EventEngine } from "../Event";
import type { EntityFetchResult } from "./EntityFetchResult";

/**
 * EntityEngine - Entity and Component Management
 *
 * Manages entities, components, and their relationships in an ECS pattern.
 * Handles entity creation, component registration, and entity queries.
 * Uses dependency injection for EventEngine instead of singleton pattern.
 */
export class EntityEngine {
  private entities: Map<string, Set<string>>;
  private components: Map<string, Map<string, unknown>>;
  private componentFactories: Map<string, (...args: unknown[]) => unknown>;
  private eventEngine: EventEngine;

  constructor(eventEngine: EventEngine) {
    this.entities = new Map();
    this.components = new Map();
    this.componentFactories = new Map();
    this.eventEngine = eventEngine;
  }

  // ========================================
  // ENTITY MANAGEMENT
  // ========================================

  /**
   * Creates a new entity with optional custom ID
   * @param id - Optional custom entity ID, auto-generates with "ENT_" prefix if not provided
   * @returns The entity ID
   */
  createEntity(id?: string): string {
    const entity_id = id || generateId("ENT");
    this.entities.set(entity_id, new Set());

    // Emit entity created event
    this.eventEngine.emit("entity:created", entity_id);

    return entity_id;
  }

  /**
   * Gets an entity by its ID with all its components
   * @template T - The expected shape of the component data
   * @param entityId - The ID of the entity to retrieve
   * @returns The entity with its components, or undefined if entity doesn't exist
   */
  getEntity<T extends Record<string, unknown>>(entityId: string): EntityFetchResult<T> {
    if (!this.entities.has(entityId)) {
      return undefined;
    }

    const entityComponents = this.entities.get(entityId);
    if (!entityComponents) {
      return undefined;
    }

    const components: Record<string, unknown> = {};
    for (const componentName of entityComponents) {
      components[componentName] = this.getComponent(entityId, componentName);
    }

    return { entityId, components: components as T };
  }

  /**
   * Removes an entity and all its associated components
   * @param entityId - The ID of the entity to remove
   */
  removeEntity(entityId: string): void {
    if (!this.entities.has(entityId)) {
      return;
    }

    const entityComponents = this.entities.get(entityId);
    if (!entityComponents) {
      return;
    }

    // Emit entity removing event (before removal)
    this.eventEngine.emit("entity:removing", entityId, Array.from(entityComponents));

    // Remove entity from all component maps
    for (const componentName of entityComponents) {
      const componentMap = this.components.get(componentName);
      if (componentMap) {
        componentMap.delete(entityId);
      }
    }

    // Remove entity from entities map
    this.entities.delete(entityId);

    // Emit entity removed event (after removal)
    this.eventEngine.emit("entity:removed", entityId);
  }

  // ========================================
  // COMPONENT REGISTRATION
  // ========================================

  /**
   * Registers a new component type with the engine
   * @param name - The name of the component type
   * @param func - The factory function for creating component instances
   * @returns This EntityEngine instance for method chaining
   */
  registerComponent(name: string, func: (...args: unknown[]) => unknown): this {
    this.componentFactories.set(name, func);
    this.components.set(name, new Map());
    return this;
  }

  /**
   * Gets a list of all registered component names
   * @returns Array of registered component names
   */
  getRegisteredComponents(): string[] {
    return Array.from(this.componentFactories.keys());
  }

  // ========================================
  // COMPONENT MANAGEMENT
  // ========================================

  /**
   * Adds a component to an entity
   * @template T - The type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @param componentData - The component data
   * @throws Error if entity doesn't exist or component type isn't registered
   */
  addComponent<T>(entityId: string, componentName: string, componentData: T): void {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity with ID ${entityId} does not exist`);
    }

    if (!this.components.has(componentName)) {
      throw new Error(`Component ${componentName} is not registered`);
    }

    const componentMap = this.components.get(componentName);
    const entityComponents = this.entities.get(entityId);

    if (componentMap && entityComponents) {
      const factory = this.componentFactories.get(componentName) || (() => {});
      componentMap.set(entityId, factory(componentData));
      entityComponents.add(componentName);

      // Emit component added event
      this.eventEngine.emit("component:added", entityId, componentName, componentData);
    }
  }

  /**
   * Gets a component from an entity
   * @template T - The expected type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns The component data or undefined if not found
   */
  getComponent<T>(entityId: string, componentName: string): T | undefined {
    const componentMap = this.components.get(componentName);
    if (!componentMap) {
      return undefined;
    }
    return componentMap.get(entityId) as T;
  }

  /**
   * Checks if an entity has a specific component
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns True if the entity has the component, false otherwise
   */
  hasComponent(entityId: string, componentName: string): boolean {
    const componentMap = this.components.get(componentName);
    if (!componentMap) {
      return false;
    }
    return componentMap.has(entityId);
  }

  /**
   * Removes a component from an entity
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   */
  removeComponent(entityId: string, componentName: string): void {
    const componentMap = this.components.get(componentName);
    let componentData: unknown;

    if (componentMap) {
      componentData = componentMap.get(entityId);
      componentMap.delete(entityId);
    }

    const entityComponents = this.entities.get(entityId);
    if (entityComponents) {
      entityComponents.delete(componentName);
    }

    // Emit component removed event
    if (componentData !== undefined) {
      this.eventEngine.emit("component:removed", entityId, componentName, componentData);
    }
  }

  // ========================================
  // ENTITY QUERYING
  // ========================================

  /**
   * Queries entities that have ALL specified components
   * @template T - The expected shape of the component data
   * @param componentNames - Array of component names to match
   * @returns Array of entities with their component data
   */
  queryEntities<T extends Record<string, unknown>>(
    componentNames: string[],
  ): Array<{ entityId: string; components: T }> {
    const result: Array<{ entityId: string; components: T }> = [];

    for (const [entityId, entityComponents] of this.entities) {
      const hasAllComponents = componentNames.every((componentName) =>
        entityComponents.has(componentName),
      );

      if (hasAllComponents) {
        const components: Record<string, unknown> = {};
        for (const componentName of componentNames) {
          components[componentName] = this.getComponent(entityId, componentName);
        }
        result.push({ entityId, components: components as T });
      }
    }

    return result;
  }

  /**
   * Queries entities that have ANY of the specified components
   * @template T - The expected shape of the component data
   * @param componentNames - Array of component names to match
   * @returns Array of entities with their component data
   */
  queryEntitiesWithAny<T extends Record<string, unknown>>(
    componentNames: string[],
  ): Array<{ entityId: string; components: T }> {
    const result: Array<{ entityId: string; components: T }> = [];

    for (const [entityId, entityComponents] of this.entities) {
      const hasAnyComponent = componentNames.some((componentName) =>
        entityComponents.has(componentName),
      );

      if (hasAnyComponent) {
        const components: Record<string, unknown> = {};
        for (const componentName of componentNames) {
          if (entityComponents.has(componentName)) {
            components[componentName] = this.getComponent(entityId, componentName);
          }
        }
        result.push({ entityId, components: components as T });
      }
    }

    return result;
  }
}
