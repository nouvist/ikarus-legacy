export default class EdgeInsets {
  private _left: number;
  private _right: number;
  private _top: number;
  private _bottom: number;

  static zero = new EdgeInsets();

  constructor({
    left = 0,
    right = 0,
    top = 0,
    bottom = 0,
  }: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  } = {}) {
    this._left = left;
    this._right = right;
    this._top = top;
    this._bottom = bottom;

    this.copyWith = this.copyWith.bind(this);
    this.toCssVariable = this.toCssVariable.bind(this);
    this.toString = this.toString.bind(this);
  }

  static all(value: number) {
    return new EdgeInsets({
      left: value,
      right: value,
      top: value,
      bottom: value,
    });
  }

  static symmetric({
    horizontal = 0,
    vertical = 0,
  }: {
    horizontal?: number;
    vertical?: number;
  } = {}) {
    return new EdgeInsets({
      left: horizontal,
      right: horizontal,
      top: vertical,
      bottom: vertical,
    });
  }

  static fromLTRB(left: number, top: number, right: number, bottom: number) {
    return new EdgeInsets({ left, top, right, bottom });
  }

  copyWith({
    left,
    right,
    top,
    bottom,
  }: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  } = {}) {
    return new EdgeInsets({
      left: left ?? this._left,
      right: right ?? this._right,
      top: top ?? this._top,
      bottom: bottom ?? this._bottom,
    });
  }

  get left() {
    return this._left;
  }

  get right() {
    return this._right;
  }

  get top() {
    return this._top;
  }

  get bottom() {
    return this._bottom;
  }

  get horizontal() {
    return this._left + this._right;
  }

  get vertical() {
    return this._top + this._bottom;
  }

  toCssVariable() {
    return `${this._top}px ${this._right}px ${this._bottom}px ${this._left}px;`;
  }

  toString() {
    return `EdgeInsets(top: ${this._top}, right: ${this._right}, bottom: ${this._bottom}, left: ${this._left})`;
  }
}
