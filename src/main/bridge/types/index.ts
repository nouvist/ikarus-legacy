import { EnvEventMap } from "~/main/bridge/types/env";
import { WindowEventMap } from "~/main/bridge/types/window";
export * from "~/main/bridge/types/window";
export * from "~/main/bridge/types/env";

export type EventMap = WindowEventMap & EnvEventMap;
export type EventKey = keyof EventMap;
