import { CIRCLE_COMPONENT } from "./Drawable/Shapes/CircleComponent";
import { RECTANGLE_COMPONENT } from "./Drawable/Shapes/RectangleComponent";
import { SPRITE_COMPONENT } from "./Drawable/SpriteComponent";
import { MOUSE_COMPONENT } from "./Input/MouseComponent";
import { COLLIDER_RECTANGLE_COMPONENT } from "./Physics/ColliderRectangleComponent";
import { RIGID_BODY_RECTANGLE_COMPONENT } from "./Physics/RigidBodyRectangleComponent";
import { SENSOR_RECTANGLE_COMPONENT } from "./Physics/SensorRectangleComponent";

export const DEFAULT_COMPONENTS = [
  /* Drawables */
  SPRITE_COMPONENT,
  RECTANGLE_COMPONENT,
  CIRCLE_COMPONENT,
  /* Input */
  MOUSE_COMPONENT,
  /* Physics */
  COLLIDER_RECTANGLE_COMPONENT,
  RIGID_BODY_RECTANGLE_COMPONENT,
  SENSOR_RECTANGLE_COMPONENT,
];
