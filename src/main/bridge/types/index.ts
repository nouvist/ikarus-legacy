import { WindowEventMap } from "~/main/bridge/types/window";
export * from "~/main/bridge/types/window";

export type EventMap = WindowEventMap;
export type EventKey = keyof EventMap;
