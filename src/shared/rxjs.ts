import { BehaviorSubject, Observable, Subject } from "rxjs";

export class Mutex extends BehaviorSubject<boolean> {
  constructor(locked = false) {
    super(locked);
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);
  }

  get isLocked() {
    return this.value;
  }

  get isUnlocked() {
    return !this.value;
  }

  lock() {
    this.next(true);
  }

  unlock() {
    this.next(false);
  }

  asImmutable(): ImmutableMutex {
    return this;
  }
}

export interface ImmutableMutex extends ImmutableBehaviorSubject<boolean> {}

export class CombinedMutexes extends Mutex {
  protected _subscriptions = [] as ImmutableMutex[];

  constructor(...mutexes: ImmutableMutex[]) {
    super(mutexes.every((mutex) => mutex.getValue()));

    this._handleNext = this._handleNext.bind(this);
    this.watch = this.watch.bind(this);

    mutexes.forEach(this.watch);
  }

  watch(mutex: ImmutableMutex) {
    if (this._subscriptions.includes(mutex)) return;
    this._subscriptions.push(mutex);
    mutex.subscribe({
      next: this._handleNext,
      complete: () => {
        this._subscriptions.splice(this._subscriptions.indexOf(mutex), 1);
        this._handleNext();
      },
    });

    this._handleNext();
  }

  protected _handleNext() {
    const nextValue = this._subscriptions.every((mutex) => mutex.getValue());
    if (this.value === nextValue) return;
    this.next(nextValue);
  }
}

export interface ImmutableBehaviorSubject<T>
  extends Omit<BehaviorSubject<T>, "next" | "complete"> {}

export abstract class Rxjs {
  static asImmutable<T>(raw: BehaviorSubject<T>): ImmutableBehaviorSubject<T> {
    return raw as ImmutableBehaviorSubject<T>;
  }

  static waitUntil<T>(
    observable: Observable<T>,
    callback: (value: T) => boolean
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const subscription = observable.subscribe((value) => {
        if (!callback(value)) return;
        subscription.unsubscribe();
        resolve();
      });
    });
  }

  static waitUntilComplete<T>(subject: Subject<T>): Promise<void> {
    if (subject.closed) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const subscription = subject.subscribe({
        complete: () => {
          subscription.unsubscribe();
          resolve();
        },
      });
    });
  }
}
