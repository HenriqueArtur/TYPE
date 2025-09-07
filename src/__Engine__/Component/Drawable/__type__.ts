import type { Container } from "pixi.js";

export interface Drawable<ContainerType extends Container, Resource> {
  _drawable: ContainerType;
  _resource: Resource;
}
