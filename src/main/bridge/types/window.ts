import { RendererVoidEventItem, VoidEventItem } from "~/shared/event";

export interface WindowEventMap {
  "Window::minimize": VoidEventItem;
  "Window::maximize": VoidEventItem;
  "Window::close": VoidEventItem;
  "Window::show": VoidEventItem;
  "Window::hide": VoidEventItem;
  "Window::debug": VoidEventItem;
  "Window::setTitleBarColor": RendererVoidEventItem<string>;
}
