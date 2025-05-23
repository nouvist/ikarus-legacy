export interface EventItem<Renderer, Main> {
  fromRenderer: Renderer;
  fromMain: Main;
}

export interface MainVoidEventItem<Main> extends EventItem<undefined, Main> {
  fromRenderer: undefined;
}

export interface RendererVoidEventItem<Renderer>
  extends EventItem<Renderer, undefined> {
  fromMain: undefined;
}
