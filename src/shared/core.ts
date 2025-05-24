export function getRandom() {
  return Math.random().toString(16).slice(2, 10);
}

export function createRefCell<T>(value: T) {
  return {
    value,
  };
}
