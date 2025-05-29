export default class EdgeFlags {
  static left = new EdgeFlags(1 << 0);
  static right = new EdgeFlags(1 << 1);
  static top = new EdgeFlags(1 << 2);
  static bottom = new EdgeFlags(1 << 3);
  static all = new EdgeFlags(0b1111);

  constructor(protected _value: number) {
    this.has = this.has.bind(this);
    this.toString = this.toString.bind(this);
  }

  static combine(...borders: (EdgeFlags | undefined | null)[]) {
    return borders
      .filter((border) => !!border)
      .reduce((acc, border) => acc | border._value, 0);
  }

  has(border: EdgeFlags) {
    return (this._value & border._value) !== 0;
  }

  get isLeft() {
    return this.has(EdgeFlags.left);
  }

  get isRight() {
    return this.has(EdgeFlags.right);
  }

  get isTop() {
    return this.has(EdgeFlags.top);
  }

  get isBottom() {
    return this.has(EdgeFlags.bottom);
  }

  toString() {
    return `EdgeFlags(left: ${this.isLeft}, right: ${this.isRight}, top: ${this.isTop}, bottom: ${this.isBottom})`;
  }
}
