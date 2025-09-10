import { COLLIDER_CIRCLE_COMPONENT } from "./ColliderCircleComponent";
import { COLLIDER_RECTANGLE_COMPONENT } from "./ColliderRectangleComponent";
import { RIGID_BODY_CIRCLE_COMPONENT } from "./RigidBodyCircleComponent";
import { RIGID_BODY_RECTANGLE_COMPONENT } from "./RigidBodyRectangleComponent";
import { SENSOR_CIRCLE_COMPONENT } from "./SensorCircleComponent";
import { SENSOR_RECTANGLE_COMPONENT } from "./SensorRectangleComponent";

export const PHYSICS_COMPONENTS = [
  "ColliderRectangleComponent",
  "RigidBodyRectangleComponent",
  "SensorRectangleComponent",
  "ColliderCircleComponent",
  "RigidBodyCircleComponent",
  "SensorCircleComponent",
];

export const DEFAULT_PHYSICS_COMPONENTS = [
  COLLIDER_RECTANGLE_COMPONENT,
  RIGID_BODY_RECTANGLE_COMPONENT,
  SENSOR_RECTANGLE_COMPONENT,
  COLLIDER_CIRCLE_COMPONENT,
  RIGID_BODY_CIRCLE_COMPONENT,
  SENSOR_CIRCLE_COMPONENT,
];
