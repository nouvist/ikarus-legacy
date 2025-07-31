import BrowserControllerImpl from "~/renderer/components/browser/controller/controller_implementation";
import Browser from "./view/raw";

export * from "./controller";
export * from "./controller/bridge";
export * from "./controller/controller";
export * from "./controller/controller_implementation";
export * from "./view/raw";

export type BrowserController = BrowserControllerImpl;
export const BrowserController = BrowserControllerImpl;

export default Browser;
