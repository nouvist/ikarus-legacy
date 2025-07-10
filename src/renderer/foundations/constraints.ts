import { css } from "styled-components";

export default class Constraints {
  private _minWidth: number | undefined;
  private _maxWidth: number | undefined;
  private _minHeight: number | undefined;
  private _maxHeight: number | undefined;
  private _width: number | undefined;
  private _height: number | undefined;

  constructor({
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    width,
    height,
  }: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    width?: number;
    height?: number;
  } = {}) {
    this._minWidth = minWidth;
    this._maxWidth = maxWidth;
    this._minHeight = minHeight;
    this._maxHeight = maxHeight;
    this._width = width;
    this._height = height;

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
    const [minWidth, maxWidth, minHeight, maxHeight, width, height] = [
      this._minWidth,
      this._maxWidth,
      this._minHeight,
      this._maxHeight,
      this._width,
      this._height,
    ].map((value) =>
      value !== undefined ? (isFinite(value) ? `${value}px` : "100%") : "auto"
    );

    return css`
      min-width: ${minWidth};
      max-width: ${maxWidth};
      min-height: ${minHeight};
      max-height: ${maxHeight};
      width: ${width};
      height: ${height};
    `;
  }

  toString() {
    return `Constraints(minWidth: ${this._minWidth}, maxWidth: ${this._maxWidth}, minHeight: ${this._minHeight}, maxHeight: ${this._maxHeight})`;
  }
}
