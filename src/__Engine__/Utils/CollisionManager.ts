import type { RectangularBodyComponent } from "../Component/Physics";

export interface CollidableGameObject {
  body: RectangularBodyComponent;
  destroy(): void;
  name: string;
}

export class CollisionManager {
  private objects: CollidableGameObject[] = [];

  addObject(obj: CollidableGameObject) {
    this.objects.push(obj);
  }

  removeObject(obj: CollidableGameObject) {
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
  }

  checkCollisions(): CollidableGameObject[] {
    const destroyedObjects: CollidableGameObject[] = [];

    for (let i = 0; i < this.objects.length; i++) {
      for (let j = i + 1; j < this.objects.length; j++) {
        const obj1 = this.objects[i];
        const obj2 = this.objects[j];

        if (this.areColliding(obj1.body, obj2.body)) {
          console.log(`Collision detected between ${obj1.name} and ${obj2.name}!`);

          // Only destroy Bunny2, keep Bunny1 (mouse follower)
          if (obj1.name === "Bunny2" && !destroyedObjects.includes(obj1)) {
            destroyedObjects.push(obj1);
            console.log(`${obj1.name} destroyed!`);
          }
          if (obj2.name === "Bunny2" && !destroyedObjects.includes(obj2)) {
            destroyedObjects.push(obj2);
            console.log(`${obj2.name} destroyed!`);
          }
        }
      }
    }

    // Destroy all collided objects
    for (const obj of destroyedObjects) {
      obj.destroy();
      this.removeObject(obj);
    }

    return destroyedObjects;
  }

  private areColliding(body1: RectangularBodyComponent, body2: RectangularBodyComponent): boolean {
    const matter_body1 = body1.getBody();
    const matter_body2 = body2.getBody();

    // Simple AABB collision detection using Matter.js body bounds
    const bounds1 = matter_body1.bounds;
    const bounds2 = matter_body2.bounds;

    return !(
      bounds1.max.x < bounds2.min.x ||
      bounds2.max.x < bounds1.min.x ||
      bounds1.max.y < bounds2.min.y ||
      bounds2.max.y < bounds1.min.y
    );
  }

  clear() {
    this.objects = [];
  }
}
