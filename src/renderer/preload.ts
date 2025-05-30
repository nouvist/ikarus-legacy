import { contextBridge } from "electron";
import createManaged from "~/renderer/managed";

const managed = createManaged();
try {
  contextBridge.exposeInMainWorld("Managed", managed);
} catch {
  Object.defineProperty(window, "Managed", {
    value: managed,
    writable: false,
  });
}

declare global {
  const Managed: ReturnType<typeof createManaged>;
}
