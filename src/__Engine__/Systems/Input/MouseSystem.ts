import type { MouseComponent } from "../../Component/Input/MouseComponent";
import type { TypeEngine } from "../../TypeEngine";
import type { System } from "../System";

export class MouseSystem implements System<TypeEngine> {
  name = "MouseSystem";
  priority = 1;
  enabled = true;

  private mouse_position_screen = { x: 0, y: 0 };
  private mouse_position_window = { x: 0, y: 0 };
  private mouse_buttons = { left: false, right: false, middle: false };
  private mouse_wheel = { deltaX: 0, deltaY: 0, deltaZ: 0 };

  // Store bound handler references for cleanup
  private boundHandleMouseMove?: (event: MouseEvent) => void;
  private boundHandleMouseDown?: (event: MouseEvent) => void;
  private boundHandleMouseUp?: (event: MouseEvent) => void;
  private boundHandleWheel?: (event: WheelEvent) => void;
  private boundHandleContextMenu?: (event: Event) => void;

  async init(_engine: TypeEngine) {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Bind handlers once and store references
      this.boundHandleMouseMove = this.handleMouseMove.bind(this);
      this.boundHandleMouseDown = this.handleMouseDown.bind(this);
      this.boundHandleMouseUp = this.handleMouseUp.bind(this);
      this.boundHandleWheel = this.handleWheel.bind(this);
      this.boundHandleContextMenu = (e) => e.preventDefault();

      // Track mouse position on screen and window
      window.addEventListener("mousemove", this.boundHandleMouseMove);

      // Track mouse button states
      window.addEventListener("mousedown", this.boundHandleMouseDown);
      window.addEventListener("mouseup", this.boundHandleMouseUp);

      // Track mouse wheel
      window.addEventListener("wheel", this.boundHandleWheel);

      // Context menu prevention (optional - prevents right-click menu)
      window.addEventListener("contextmenu", this.boundHandleContextMenu);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mouse_position_screen.x = event.screenX;
    this.mouse_position_screen.y = event.screenY;
    this.mouse_position_window.x = event.clientX;
    this.mouse_position_window.y = event.clientY;
  }

  private handleMouseDown(event: MouseEvent): void {
    switch (event.button) {
      case 0: // Left button
        this.mouse_buttons.left = true;
        break;
      case 1: // Middle button
        this.mouse_buttons.middle = true;
        break;
      case 2: // Right button
        this.mouse_buttons.right = true;
        break;
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    switch (event.button) {
      case 0: // Left button
        this.mouse_buttons.left = false;
        break;
      case 1: // Middle button
        this.mouse_buttons.middle = false;
        break;
      case 2: // Right button
        this.mouse_buttons.right = false;
        break;
    }
  }

  private handleWheel(event: WheelEvent): void {
    this.mouse_wheel.deltaX = event.deltaX;
    this.mouse_wheel.deltaY = event.deltaY;
    this.mouse_wheel.deltaZ = event.deltaZ;

    // Reset wheel deltas after capturing them
    // This ensures wheel data is only available for one frame
    setTimeout(() => {
      this.mouse_wheel.deltaX = 0;
      this.mouse_wheel.deltaY = 0;
      this.mouse_wheel.deltaZ = 0;
    }, 0);
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    const mouse_entities = engine.EntityEngine.query<{ MouseComponent: MouseComponent[] }>([
      "MouseComponent",
    ]);

    for (const { components } of mouse_entities) {
      for (const mouse_component of components.MouseComponent) {
        // Update mouse position data
        mouse_component.screenPosition.x = this.mouse_position_screen.x;
        mouse_component.screenPosition.y = this.mouse_position_screen.y;
        mouse_component.windowPosition.x = this.mouse_position_window.x;
        mouse_component.windowPosition.y = this.mouse_position_window.y;

        // Update mouse button states
        mouse_component.buttons.left = this.mouse_buttons.left;
        mouse_component.buttons.right = this.mouse_buttons.right;
        mouse_component.buttons.middle = this.mouse_buttons.middle;

        // Update wheel data
        mouse_component.wheel.deltaX = this.mouse_wheel.deltaX;
        mouse_component.wheel.deltaY = this.mouse_wheel.deltaY;
        mouse_component.wheel.deltaZ = this.mouse_wheel.deltaZ;
      }
    }
  }

  destroy(_engine: TypeEngine): void {
    if (typeof window !== "undefined") {
      if (this.boundHandleMouseMove) {
        window.removeEventListener("mousemove", this.boundHandleMouseMove);
      }
      if (this.boundHandleMouseDown) {
        window.removeEventListener("mousedown", this.boundHandleMouseDown);
      }
      if (this.boundHandleMouseUp) {
        window.removeEventListener("mouseup", this.boundHandleMouseUp);
      }
      if (this.boundHandleWheel) {
        window.removeEventListener("wheel", this.boundHandleWheel);
      }
      if (this.boundHandleContextMenu) {
        window.removeEventListener("contextmenu", this.boundHandleContextMenu);
      }
    }
  }
}
