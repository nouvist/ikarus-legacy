import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import { ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";
import registerHtmlTools from "~/renderer/components/chat/controller/tools/html";
import registerTextInputTools from "~/renderer/components/chat/controller/tools/text_input";
import registerNavigationTools from "~/renderer/components/chat/controller/tools/navigation";
import { RefCell } from "~/shared/core";

export default function createTools(
  browser: RefCell<BrowserController>,
  fetcher: Fetcher
) {
  const registrar = new ToolRegistrar();
  registerNavigationTools(registrar, browser);
  registerButtonTools(registrar, browser, fetcher);
  registerTextInputTools(registrar, browser, fetcher);
  registerHtmlTools(registrar, browser);

  return registrar.finalize();
}

