import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import registerCsvTools from "~/renderer/components/chat/controller/tools/csv";
import { ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";
import registerHtmlTools from "~/renderer/components/chat/controller/tools/html";
import registerNavigationTools from "~/renderer/components/chat/controller/tools/navigation";
import registerTextInputTools from "~/renderer/components/chat/controller/tools/text_input";
import { CsvController } from "~/renderer/components/csv";

export default function createTools(
  browser: BrowserController,
  csv: CsvController,
  fetcher: Fetcher
) {
  const registrar = new ToolRegistrar();
  registerNavigationTools(registrar, browser);
  registerButtonTools(registrar, browser, fetcher);
  registerTextInputTools(registrar, browser, fetcher);
  registerHtmlTools(registrar, browser, fetcher);
  registerCsvTools(registrar, csv);

  return registrar.finalize();
}

