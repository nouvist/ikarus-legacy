import { EventItem, MainVoidEventItem } from "~/shared/event";

export interface EnvEventMap {
  "Env::get": EventItem<string, string | undefined>;
  "Env::isDebug": MainVoidEventItem<boolean>
}
