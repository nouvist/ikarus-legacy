import { Children, ForwardedRef, Key, ReactNode, useRef } from "react";
import { createCompleter, getRandom } from "~/shared/core";

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
  return useRef(getRandom()).current;
}

export function useCompleter<T>() {
  return useRef(createCompleter<T>()).current;
}

export function bindRefs<T>(
  ...refs: (
    | ForwardedRef<T>
    | (() => void)
    | ((value: T) => void)
    | undefined
    | null
  )[]
) {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      else if (typeof ref === "function") ref(value);
      else if (ref && "current" in ref) ref.current = value;
    }
  };
}
