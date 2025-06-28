import { Observable, Subject } from "rxjs";

export function getRandom() {
  return Math.random().toString(16).slice(2, 10);
}

export interface RefCell<T> {
  value: T;
}

export function createRefCell<T>(value: T) {
  return {
    value,
  } as RefCell<T>;
}

export type Completer<T> = ReturnType<typeof createCompleter<T>>;

export function createCompleter<T>() {
  let resolveCallback: (value: T) => void;
  let rejectCallback: (reason?: any) => void;
  let isResolved = false;
  let isRejected = false;
  const promise = new Promise<T>((res, rej) => {
    resolveCallback = res;
    rejectCallback = rej;
  });

  function resolve(value: T) {
    if (isResolved || isRejected) return false;
    isResolved = true;
    resolveCallback(value);
  }

  function reject(reason?: any) {
    if (isResolved || isRejected) return false;
    isRejected = true;
    rejectCallback(reason);
    return true;
  }

  function encapsulate(value: T | Promise<T>): Promise<T> {
    Promise.resolve(value).then(resolve, reject);
    return promise;
  }

  return {
    resolve,
    reject,
    encapsulate,
    wait: () => promise,
    isResolved: () => isResolved,
    isRejected: () => isRejected,
    isFinally: () => isResolved || isRejected,
  };
}

export async function waitObservableUntil<T>(
  observable: Observable<T>,
  callback: (value: T) => boolean
) {
  const { wait, resolve } = createCompleter<void>();
  const subscription = observable.subscribe(handler);
  function handler(value: T) {
    if (!callback(value)) return;
    subscription.unsubscribe();
    resolve();
  }

  await wait();
}

export async function waitSubjectUntilClosed<T>(subject: Subject<T>) {
  if (subject.closed) return;
  const { wait, resolve } = createCompleter<void>();
  const subscription = subject.subscribe({
    complete: () => {
      subscription.unsubscribe();
      resolve();
    },
  });

  await wait();
}
