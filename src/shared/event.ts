export interface EventItem<Renderer, Main> {
  fromRenderer: Renderer;
  fromMain: Main;
}

export type VoidEventItem = EventItem<void, void>;
export type MainVoidEventItem<Main> = EventItem<void, Main>;
export type RendererVoidEventItem<Renderer> = EventItem<Renderer, void>;

