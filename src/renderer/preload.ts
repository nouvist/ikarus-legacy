import { contextBridge } from "electron";
import createManaged from "~/renderer/managed";

const managed = createManaged();
try {
  // isolated context
  contextBridge.exposeInMainWorld("Managed", managed);
} catch {
  // non-isolated context
  Object.defineProperty(window, "Managed", {
    value: managed,
    writable: false,
  });
}

declare global {
  const Managed: ReturnType<typeof createManaged>;
}
