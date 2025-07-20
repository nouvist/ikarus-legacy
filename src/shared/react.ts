import { Children, Key, ReactNode, Ref, useRef } from "react";
import { useObservable } from "react-rx";
import { Observable } from "rxjs";
import { Completer, createCompleter, getRandom } from "~/shared/core";

export function getKey(child: ReactNode) {
  if (typeof child !== "object") return undefined;
  return (child as never)["key"] as Key | undefined;
}

export function getTwo(children: ReactNode) {
  let left: ReactNode;
  let right: ReactNode;

  Children.forEach(children, (child, index) => {
    if (index === 0) left = child;
    if (index === 1) right = child;
  });

  return [left, right];
}

export function useRandom() {
  const ref = useRef<string | undefined>(undefined);
  return (ref.current ??= getRandom());
}

export function useCompleter<T>() {
  const ref = useRef<Completer<T>>(null);
  return (ref.current ??= createCompleter<T>());
}

export function useObservableWithValue<T>(value: Observable<T> & { value: T }) {
  useObservable(value);
  return value.value;
}

export function registerRef<T>(ref: Ref<T> | undefined | null, value: T) {
  if (typeof ref === "function") ref(value);
  if (ref && "current" in ref) ref.current = value;
  return value;
}

export function bindRefs<T>(
  ...refs: (Ref<T> | (() => void) | ((value: T) => void) | undefined | null)[]
) {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      else if (typeof ref === "function") ref(value);
      else if (ref && "current" in ref) ref.current = value;
    }
  };
}
