import { ThemeEventMap } from "~/main/bridge/types/theme";
import { WindowEventMap } from "~/main/bridge/types/window";

export { ThemeEvent } from "~/main/bridge/types/theme";

export type EventMap = ThemeEventMap & WindowEventMap;
export type EventKey = keyof EventMap;
