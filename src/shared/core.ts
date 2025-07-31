export class RefCell<T> {
  constructor(public value: T) {}
}

export class LateRefCell<T> extends RefCell<T> {
  constructor() {
    super(undefined as never);
  }

  get isInitialized() {
    return this.value !== undefined;
  }

  get isUninitialized() {
    return !this.isInitialized;
  }
}

export class Completer<T = void> {
  protected _isResolved = false;
  protected _isRejected = false;
  protected _resolve?: (value: T) => void;
  protected _reject?: (reason?: any) => void;
  protected _promise: Promise<T>;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.encapsulate = this.encapsulate.bind(this);
    this.wait = this.wait.bind(this);
  }

  resolve(value: T) {
    if (this._isResolved || this._isRejected) return false;
    if (!this._resolve) return setImmediate(() => this.resolve(value));
    this._isResolved = true;
    this._resolve(value);
    return true;
  }

  reject(reason?: any) {
    if (this._isResolved || this._isRejected) return false;
    if (!this._reject) return setImmediate(() => this.reject(reason));
    this._isRejected = true;
    this._reject(reason);
    return true;
  }

  encapsulate(value: T | Promise<T>): Promise<T> {
    Promise.resolve(value).then(
      this.resolve.bind(this),
      this.reject.bind(this)
    );
    return this._promise;
  }

  wait(): Promise<T> {
    return this._promise;
  }

  get isResolved() {
    return this._isResolved;
  }

  get isRejected() {
    return this._isRejected;
  }

  get isFinally() {
    return this._isResolved || this._isRejected;
  }
}

export function getRandom() {
  return Math.random().toString(16).slice(2, 10);
}

export function inline(str: string) {
  return str
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");
}

export function raw(str: string) {
  const lines = str.split("\n");
  while (lines[0].trim().length === 0) {
    lines.shift();
  }
  while (lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  let leftIndent = Infinity;
  for (const line in lines) {
    const indent = line.search(/\S/);
    if (indent === -1) continue;
    leftIndent = Math.min(leftIndent, indent);
  }

  if (leftIndent === Infinity) return "";
  return lines
    .map((line) => line.slice(leftIndent).trimEnd())
    .join("\n")
    .trim();
}

export function immediate<T = undefined>(value: T) {
  return new Promise<T>((resolve) => {
    setImmediate(() => resolve(value));
  });
}
