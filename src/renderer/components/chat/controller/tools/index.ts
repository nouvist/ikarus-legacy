import { BrowserController } from "~/renderer/components/browser";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import { ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";
import registerNavigationTools from "~/renderer/components/chat/controller/tools/navigation";

export default function createTools(browser: BrowserController) {
  const registrar = new ToolRegistrar();
  registerNavigationTools(registrar, browser);
  registerButtonTools(registrar, browser);

  return registrar.finalize();
}
