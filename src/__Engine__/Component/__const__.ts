import { SPRITE_COMPONENT } from "./Drawable/SpriteComponent";
import { COLLIDER_RECTANGLE_COMPONENT } from "./Physics/ColliderRectangleComponent";
import { RIGID_BODY_RECTANGLE_COMPONENT } from "./Physics/RigidBodyRectangleComponent";
import { SENSOR_RECTANGLE_COMPONENT } from "./Physics/SensorRectangleComponent";

export const DEFAULT_COMPONENTS = [
  /* Drawables */
  SPRITE_COMPONENT,
  /* Physics */
  COLLIDER_RECTANGLE_COMPONENT,
  RIGID_BODY_RECTANGLE_COMPONENT,
  SENSOR_RECTANGLE_COMPONENT,
];
