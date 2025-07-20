import { BrowserController } from "~/renderer/components/browser";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import { ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";
import registerHtmlTools from "~/renderer/components/chat/controller/tools/html";
import registerInputTools from "~/renderer/components/chat/controller/tools/input";
import registerNavigationTools from "~/renderer/components/chat/controller/tools/navigation";

export default function createTools(browser: BrowserController) {
  const registrar = new ToolRegistrar();
  registerNavigationTools(registrar, browser);
  registerButtonTools(registrar, browser);
  registerInputTools(registrar, browser);
  registerHtmlTools(registrar, browser);

  return registrar.finalize();
}
