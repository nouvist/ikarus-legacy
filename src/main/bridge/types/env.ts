import { EventItem } from "~/shared/event";

export interface EnvEventMap {
  "Env::get": EventItem<string, string | undefined>;
}
