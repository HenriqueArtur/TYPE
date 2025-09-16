import { DEFAULT_COMPONENTS } from "../../Component/__const__";
import type { ComponentInstanceManage } from "../../Component/ComponentInstanceManage";
import type { TypeEngine } from "../../TypeEngine";
import { generateId } from "../../Utils/id";
import { joinPath } from "../../Utils/path";
import { pathToFileURL } from "../../Utils/pathToFileURL";
import type { EventEngine } from "../Event";
import type {
  ComponentsManageSerialized,
  EntityFetchResult,
  GameObjectSerialized,
} from "./__types__";

export interface EntityEngineOptions {
  engine: TypeEngine;
  EventEngine: EventEngine;
}

export interface ComponentInstance {
  id: string;
  name: string;
  data: unknown;
}

export interface ComponentAddResult {
  componentId: string;
}

/**
 * EntityEngine - Entity and Component Management
 *
 * Manages entities, components, and their relationships in an ECS pattern.
 * Handles entity creation, component registration, and entity queries.
 * Uses dependency injection for EventEngine instead of singleton pattern.
 */
export class EntityEngine {
  private engine: TypeEngine;
  private entities: Map<string, Set<string>>; // entityId -> Set<componentId>
  private components: Map<string, ComponentInstance>; // componentId -> ComponentInstance
  private componentFactories: Map<string, (args: object) => unknown>; // componentName -> factory
  private eventEngine: EventEngine;
  private registeredEventHandlers: Map<
    string,
    { eventName: string; handler: (...args: unknown[]) => void }
  >; // entityId -> event registration

  constructor({ engine, EventEngine }: EntityEngineOptions) {
    this.engine = engine;
    this.entities = new Map();
    this.components = new Map();
    this.componentFactories = new Map();
    this.eventEngine = EventEngine;
    this.registeredEventHandlers = new Map();
  }

  // ========================================
  // ENTITY MANAGEMENT
  // ========================================

  async setup() {
    this.setupDefaultComponents();
    await this.setupCustomComponents();
  }

  private setupDefaultComponents() {
    for (const { name, create } of DEFAULT_COMPONENTS) {
      this.registerComponent(name, create as (...args: unknown[]) => unknown);
    }
  }

  private async setupCustomComponents() {
    const managePath = joinPath(this.engine.projectPath, "component.manage.json");
    const customComponentsMap: ComponentsManageSerialized =
      await window.electronAPI.readJsonFile(managePath);
    for (const [name, componentPath] of Object.entries(customComponentsMap)) {
      const absolute = await window.electronAPI.absolutePath(
        joinPath(this.engine.projectPath, componentPath),
      );
      try {
        // Convert to proper file URL for dynamic import
        const fileUrl = pathToFileURL(absolute);
        const componentModule = await import(fileUrl);
        const ComponentModule: ComponentInstanceManage<string, unknown, unknown> | undefined =
          componentModule.default || componentModule[name];

        if (ComponentModule) {
          this.registerComponent(name, ComponentModule.create);
        }
      } catch (error) {
        console.warn(`Failed to load Custom Component ${name} from ${absolute}:`, error);
      }
    }
  }

  setupScene(entities: GameObjectSerialized[]) {
    for (const { components } of entities) {
      const entity = this.create();
      for (const currentComponent of components) {
        this.addComponentSetup(entity, currentComponent.name, currentComponent.data);
      }
    }
  }

  /**
   * Creates a new entity with optional custom ID
   * @param id - Optional custom entity ID, auto-generates with "ENT_" prefix if not provided
   * @returns The entity ID
   */
  create(id?: string): string {
    const entity_id = id || generateId("ENT");
    this.entities.set(entity_id, new Set());
    this.eventEngine.emit("entity:created", entity_id);
    return entity_id;
  }

  /**
   * Gets an entity by its ID with all its components
   * @template T - The expected shape of the component data
   * @param entityId - The ID of the entity to retrieve
   * @returns The entity with its components, or undefined if entity doesn't exist
   */
  get<T extends Record<string, unknown>>(entityId: string): EntityFetchResult<T> {
    const entityComponentIds = this.entities.get(entityId);
    if (!entityComponentIds) {
      return;
    }
    const components: Record<string, unknown[]> = {};
    for (const componentId of entityComponentIds) {
      const component = this.components.get(componentId);
      if (component) {
        if (!components[component.name]) {
          components[component.name] = [];
        }
        (components[component.name] as unknown[]).push(component.data);
      }
    }
    return { entityId, components: components as T };
  }

  /**
   * Removes an entity and all its associated components
   * @param entityId - The ID of the entity to remove
   */
  remove(entityId: string): void {
    const entityComponentIds = this.entities.get(entityId);
    if (!entityComponentIds) {
      return;
    }
    const componentNames: string[] = [];
    if (entityComponentIds) {
      for (const componentId of entityComponentIds) {
        const component = this.components.get(componentId);
        if (component && !componentNames.includes(component.name)) {
          componentNames.push(component.name);
          if ("_body" in (component as { data: object }).data) {
            this.engine.EventEngine.emit("physics:remove:body", entityId, component.name);
            continue;
          }
          if ("_drawable" in (component as { data: object }).data) {
            this.engine.EventEngine.emit("remove:drawable", {
              entityId,
              componentName: component.name,
              componentData: component.data,
            });
          }
        }
      }
    }

    this.eventEngine.emit("entity:removing", entityId, componentNames);
    this.removeOnClear(entityId);
    this.eventEngine.emit("entity:removed", entityId);
  }

  removeOnClear(entityId: string): void {
    const entityComponentIds = this.entities.get(entityId);
    if (!entityComponentIds) {
      return;
    }
    for (const componentId of entityComponentIds) {
      this.components.delete(componentId);
    }
    this.entities.delete(entityId);
  }

  clear() {
    for (const entityId of this.entities.keys()) {
      this.removeOnClear(entityId);
    }
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
  registerComponent(name: string, func: (args: object) => unknown): this {
    this.componentFactories.set(name, func);
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
  addComponentSetup<T>(entityId: string, componentName: string, componentData: T): string {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity with ID ${entityId} does not exist`);
    }

    if (!this.componentFactories.has(componentName)) {
      throw new Error(`Component ${componentName} is not registered`);
    }

    const entityComponentIds = this.entities.get(entityId);

    if (entityComponentIds) {
      const factory = this.componentFactories.get(componentName) || (() => {});
      const componentId = generateId("COMP");
      const componentInstance: ComponentInstance = {
        id: componentId,
        name: componentName,
        data: factory(componentData as object),
      };

      this.components.set(componentId, componentInstance);
      entityComponentIds.add(componentId);
      if (componentName === "EventComponent" || componentName === "OnCollisionEventComponent") {
        this.registerEventHandler(entityId, componentName, componentData as { scriptPath: string });
      }
      return componentId;
    }

    throw new Error(`Failed to add component ${componentName} to entity ${entityId}`);
  }

  /**
   * Adds a component to an entity
   * @template T - The type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @param componentData - The component data
   * @throws Error if entity doesn't exist or component type isn't registered
   */
  addComponent<T>(
    entityId: string,
    componentName: string,
    componentData: NonNullable<T>,
  ): ComponentAddResult {
    const componentId = this.addComponentSetup(entityId, componentName, componentData);
    const component = this.components.get(componentId);

    // Emit component added event for backward compatibility
    this.eventEngine.emit("component:added", entityId, componentName, componentData);

    if (component && typeof component.data === "object" && component.data) {
      if ("_drawable" in component.data) {
        this.eventEngine.emit("add:drawable", entityId, componentName, component.data);
      }
      if ("_body" in component.data) {
        this.eventEngine.emit("physics:add:body", entityId, componentName, component.data);
      }

      // Handle event component registration
      if (componentName === "EventComponent" || componentName === "OnCollisionEventComponent") {
        this.registerEventHandler(
          entityId,
          componentName,
          component.data as { scriptPath: string },
        );
      }
    }

    return { componentId };
  }

  /**
   * Gets all components of a specific type from an entity
   * @template T - The expected type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns Array of component data for the specified type
   */
  getComponents<T>(entityId: string, componentName: string): T[] {
    const entityComponentIds = this.entities.get(entityId);
    if (!entityComponentIds) {
      return [];
    }

    const components: T[] = [];
    for (const componentId of entityComponentIds) {
      const component = this.components.get(componentId);
      if (component && component.name === componentName) {
        components.push(component.data as T);
      }
    }
    return components;
  }

  /**
   * Gets a specific component by its ID
   * @template T - The expected type of the component data
   * @param componentId - The ID of the component
   * @returns The component data or undefined if not found
   */
  getComponentById<T>(componentId: string): T | undefined {
    const component = this.components.get(componentId);
    return component ? (component.data as T) : undefined;
  }

  /**
   * Gets all components of a specific type from an entity
   * @template T - The expected type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns Array of component data for the specified type
   */
  getComponent<T>(entityId: string, componentName: string): T[] {
    return this.getComponents<T>(entityId, componentName);
  }

  /**
   * Checks if an entity has a specific component type
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns True if the entity has at least one component of the specified type
   */
  hasComponent(entityId: string, componentName: string): boolean {
    return this.getComponents(entityId, componentName).length > 0;
  }

  /**
   * Gets all component IDs of a specific type for an entity
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns Array of component IDs for the specified type
   */
  getComponentIds(entityId: string, componentName: string): string[] {
    const entityComponentIds = this.entities.get(entityId);
    if (!entityComponentIds) {
      return [];
    }

    const componentIds: string[] = [];
    for (const componentId of entityComponentIds) {
      const component = this.components.get(componentId);
      if (component && component.name === componentName) {
        componentIds.push(componentId);
      }
    }
    return componentIds;
  }

  /**
   * Removes a specific component by its ID
   * @param componentId - The ID of the component to remove
   * @returns True if the component was removed, false if not found
   */
  removeComponentById(componentId: string): boolean {
    const component = this.components.get(componentId);
    if (!component) {
      return false;
    }

    // Find the entity that owns this component
    let ownerEntityId: string | undefined;
    for (const [entityId, componentIds] of this.entities.entries()) {
      if (componentIds.has(componentId)) {
        ownerEntityId = entityId;
        break;
      }
    }

    if (!ownerEntityId) {
      return false;
    }

    // Remove component from entity's component set
    const entityComponentIds = this.entities.get(ownerEntityId);
    if (entityComponentIds) {
      entityComponentIds.delete(componentId);
    }

    // Remove component from components map
    this.components.delete(componentId);

    // Emit events for drawable and physics components
    if (typeof component.data === "object" && component.data) {
      if ("_drawable" in component.data) {
        this.eventEngine.emit("remove:drawable", ownerEntityId, component.name, component.data);
      }
      if ("_body" in component.data) {
        this.eventEngine.emit("physics:remove:body", ownerEntityId, component.name, component.data);
      }

      // Handle event component unregistration
      if (component.name === "EventComponent" || component.name === "OnCollisionEventComponent") {
        this.unregisterEventHandler(ownerEntityId);
      }
    }

    return true;
  }

  /**
   * Removes the first component of a specific type from an entity
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns True if a component was removed, false if not found
   */
  removeComponent(entityId: string, componentName: string): boolean {
    const componentIds = this.getComponentIds(entityId, componentName);
    if (componentIds.length > 0) {
      const component = this.components.get(componentIds[0]);
      const removed = this.removeComponentById(componentIds[0]);

      if (removed && component) {
        // Emit component removed event
        this.eventEngine.emit("component:removed", entityId, componentName, component.data);
      }

      return removed;
    }
    return false;
  }

  /**
   * Removes all components of a specific type from an entity
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns Number of components removed
   */
  removeAllComponents(entityId: string, componentName: string): number {
    const componentIds = this.getComponentIds(entityId, componentName);
    let removedCount = 0;

    for (const componentId of componentIds) {
      if (this.removeComponentById(componentId)) {
        removedCount++;
      }
    }

    return removedCount;
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
  query<T extends Record<string, unknown>>(
    componentNames: string[],
  ): Array<{ entityId: string; components: T }> {
    const result: Array<{ entityId: string; components: T }> = [];

    for (const [entityId] of this.entities) {
      const hasAllComponents = componentNames.every((componentName) =>
        this.hasComponent(entityId, componentName),
      );

      if (hasAllComponents) {
        const components: Record<string, unknown[]> = {};
        for (const componentName of componentNames) {
          components[componentName] = this.getComponents(entityId, componentName);
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
  queryWithAny<T extends Record<string, unknown>>(
    componentNames: string[],
  ): Array<{ entityId: string; components: T }> {
    const result: Array<{ entityId: string; components: T }> = [];

    for (const [entityId] of this.entities) {
      const hasAnyComponent = componentNames.some((componentName) =>
        this.hasComponent(entityId, componentName),
      );

      if (hasAnyComponent) {
        const components: Record<string, unknown[]> = {};
        for (const componentName of componentNames) {
          if (this.hasComponent(entityId, componentName)) {
            components[componentName] = this.getComponents(entityId, componentName);
          }
        }
        result.push({ entityId, components: components as T });
      }
    }

    return result;
  }

  // ========================================
  // EVENT HANDLER MANAGEMENT
  // ========================================

  /**
   * Registers an event handler for EventComponent or OnCollisionEventComponent
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component (EventComponent or OnCollisionEventComponent)
   * @param componentData - The component data containing scriptPath
   */
  private async registerEventHandler(
    entityId: string,
    componentName: string,
    componentData: { scriptPath: string },
  ): Promise<void> {
    try {
      // Convert project-relative path to absolute path
      const absolutePath = await window.electronAPI.absolutePath(
        joinPath(this.engine.projectPath, componentData.scriptPath),
      );

      // Dynamically import the event handler module
      // Convert to proper file URL for dynamic import
      const fileUrl = pathToFileURL(absolutePath);
      const eventModule = await import(fileUrl);
      const eventHandler = eventModule.default;

      if (!eventHandler || typeof eventHandler.handler !== "function") {
        console.warn(`Invalid event handler in ${absolutePath}`);
        return;
      }

      // Determine event name based on component type
      let eventName: string;
      if (componentName === "OnCollisionEventComponent") {
        eventName = `physics:collision:enter:${entityId}`;
      } else if (componentName === "EventComponent" && eventHandler.event) {
        eventName = eventHandler.event;
      } else {
        console.warn(`Unable to determine event name for ${componentName} in entity ${entityId}`);
        return;
      }

      // Register the event handler
      this.eventEngine.on(eventName, eventHandler.handler);

      // Store registration info for cleanup
      this.registeredEventHandlers.set(entityId, {
        eventName,
        handler: eventHandler.handler,
      });
    } catch (error) {
      console.error(`Failed to register event handler for entity ${entityId}:`, error);
    }
  }

  /**
   * Unregisters an event handler for EventComponent or OnCollisionEventComponent
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component
   * @param componentData - The component data containing scriptPath
   */
  private unregisterEventHandler(entityId: string): void {
    const registration = this.registeredEventHandlers.get(entityId);
    if (registration) {
      // Remove the event listener
      this.eventEngine.off(registration.eventName, registration.handler);

      // Remove from tracking
      this.registeredEventHandlers.delete(entityId);
    }
  }
}
