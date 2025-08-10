export class Angle {
  private _radians: number;

  constructor(radians: number) {
    this._radians = radians;
  }

  static fromDegrees(degrees: number): Angle {
    return new Angle(degrees * (Math.PI / 180));
  }

  get degrees(): number {
    return this._radians * (180 / Math.PI);
  }

  get radians(): number {
    return this._radians;
  }

  sin(): number {
    return Math.sin(this._radians);
  }
  cos(): number {
    return Math.cos(this._radians);
  }
  tan(): number {
    return Math.tan(this._radians);
  }
}
