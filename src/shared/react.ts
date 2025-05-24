import { Children, Key, ReactNode, useRef } from "react";
import { getRandom } from "~/shared/core";

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
  const ref = useRef(getRandom());
  return ref.current;
}
