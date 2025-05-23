import { MainVoidEventItem } from "~/main/bridge/types/primitive";

export interface ThemeEventMap {
  "Theme::changed": MainVoidEventItem<ThemeEvent>;
}

export interface ThemeEvent {
  isDark: boolean;
  accentColor: string;
}
