import { BrowserController } from "~/renderer/components/browser/view/raw";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import { ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";
import registerHtmlTools from "~/renderer/components/chat/controller/tools/html";
import registerInputTools from "~/renderer/components/chat/controller/tools/input";
import registerNavigationTools from "~/renderer/components/chat/controller/tools/navigation";

export default function createTools(
  browser: BrowserController,
  fetcher: Fetcher
) {
  const registrar = new ToolRegistrar();
  registerNavigationTools(registrar, browser);
  registerButtonTools(registrar, browser, fetcher);
  registerInputTools(registrar, browser);
  registerHtmlTools(registrar, browser);

  return registrar.finalize();
}
