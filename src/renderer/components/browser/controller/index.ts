import { useRef } from "react";
import BrowserControllerImpl from "~/renderer/components/browser/controller/controller_implementation";

export function useBrowserController() {
  const ref = useRef<BrowserControllerImpl>(null);
  return (ref.current ??= new BrowserControllerImpl());
}
