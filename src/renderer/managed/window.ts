import { RendererBridge } from "~/renderer/managed/bridge";

export default function createWindowManaged(bridge: RendererBridge) {
  return {
    async close() {
      await bridge.invoke("Window::close", undefined);
    },

    async minimize() {
      await bridge.invoke("Window::minimize", undefined);
    },

    async maximize() {
      await bridge.invoke("Window::maximize", undefined);
    },

    async show() {
      await bridge.invoke("Window::show", undefined);
    },

    async hide() {
      await bridge.invoke("Window::hide", undefined);
    },
  };
}
