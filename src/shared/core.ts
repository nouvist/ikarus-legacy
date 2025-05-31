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

export function createCompleter<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  let isResolved = false;
  let isRejected = false;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    isResolved: () => isResolved,
    isRejected: () => isRejected,
    isFinally: () => isResolved || isRejected,
    resolve: (value: T) => {
      if (isResolved || isRejected) return false;
      isResolved = true;
      resolve(value);
      return true;
    },
    reject: (reason?: any) => {
      if (isResolved || isRejected) return false;
      isRejected = true;
      reject(reason);
      return true;
    },
  };
}
