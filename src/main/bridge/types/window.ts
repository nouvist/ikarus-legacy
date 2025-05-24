import { VoidEventItem } from "~/main/bridge/types/primitive";

export interface WindowEventMap {
  "Window::minimize": VoidEventItem;
  "Window::maximize": VoidEventItem;
  "Window::close": VoidEventItem;
  "Window::show": VoidEventItem;
  "Window::hide": VoidEventItem;
  "Window::debug": VoidEventItem;
}

