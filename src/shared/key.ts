import { Key, ReactNode } from "react";

export default function getKey(child: ReactNode) {
  if (typeof child !== "object") return undefined;
  return (child as never)["key"] as Key | undefined;
}

