import { css } from "styled-components";

export default class Constraints {
  private _minWidth: number;
  private _maxWidth: number;
  private _minHeight: number;
  private _maxHeight: number;

  constructor({
    minWidth = 0,
    maxWidth = Infinity,
    minHeight = 0,
    maxHeight = Infinity,
  }: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  } = {}) {
    this._minWidth = minWidth;
    this._maxWidth = maxWidth;
    this._minHeight = minHeight;
    this._maxHeight = maxHeight;

    this.copyWith = this.copyWith.bind(this);
    this.toCss = this.toCss.bind(this);
    this.toString = this.toString.bind(this);
  }

  static fixed({
    width = 0,
    height = 0,
  }: {
    width?: number;
    height?: number;
  } = {}) {
    return new Constraints({
      minWidth: width,
      maxWidth: width,
      minHeight: height,
      maxHeight: height,
    });
  }

  static all(value: number) {
    return new Constraints({
      minWidth: value,
      maxWidth: value,
      minHeight: value,
      maxHeight: value,
    });
  }

  copyWith({
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
  }: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  } = {}) {
    return new Constraints({
      minWidth: minWidth ?? this._minWidth,
      maxWidth: maxWidth ?? this._maxWidth,
      minHeight: minHeight ?? this._minHeight,
      maxHeight: maxHeight ?? this._maxHeight,
    });
  }

  toCss() {
    const [minWidth, maxWidth, minHeight, maxHeight] = [
      this._minWidth,
      this._maxWidth,
      this._minHeight,
      this._maxHeight,
    ].map((value) => (isFinite(value) ? `${value}px` : "none"));

    return css`
      min-width: ${minWidth};
      max-width: ${maxWidth};
      min-height: ${minHeight};
      max-height: ${maxHeight};
    `;
  }

  toString() {
    return `Constraints(minWidth: ${this._minWidth}, maxWidth: ${this._maxWidth}, minHeight: ${this._minHeight}, maxHeight: ${this._maxHeight})`;
  }
}
