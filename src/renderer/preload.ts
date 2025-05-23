import { contextBridge } from "electron";
import createManaged from "~/renderer/managed";

contextBridge.exposeInMainWorld("Managed", createManaged());

declare global {
  const Managed: ReturnType<typeof createManaged>;
}
