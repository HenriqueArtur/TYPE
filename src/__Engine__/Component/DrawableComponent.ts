import type { GameComponent } from ".";

/**
 * Interface for components that can be rendered/drawn (sprites, textures)
 */
export interface DrawableComponent extends GameComponent {
  readonly type: string;

  /**
   * Get the visual representation for rendering
   */
  getDrawable(): unknown;

  /**
   * Update visual properties
   */
  updateVisual(data: Record<string, unknown>): void;

  /**
   * Check if the component is visible
   */
  isVisible(): boolean;

  /**
   * Set visibility
   */
  setVisible(visible: boolean): void;

  /**
   * Get dimensions if applicable
   */
  getDimensions(): { width: number; height: number } | null;
}
