import { GameObject } from ".";

export class ConcreteGameObject extends GameObject {
  update(): void {
    console.log(1);
  }
  onStart(): void {
    console.log("ConcreteGameObject started");
  }
}
