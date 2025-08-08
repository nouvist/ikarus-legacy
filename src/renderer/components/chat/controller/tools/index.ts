import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import { UserMessage } from "~/renderer/components/chat/controller/structs";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import registerCsvTools from "~/renderer/components/chat/controller/tools/csv";
import { ToolRegistrar } from "~/renderer/components/chat/controller/tools/fundamental";
import registerHtmlTools from "~/renderer/components/chat/controller/tools/html";
import registerNavigationTools from "~/renderer/components/chat/controller/tools/navigation";
import registerRadioInputTools from "~/renderer/components/chat/controller/tools/radio_input";
import registerTextInputTools from "~/renderer/components/chat/controller/tools/text_input";
import { CsvController } from "~/renderer/components/csv";

export default function createTools(
  browser: BrowserController,
  csv: CsvController,
  fetcher: Fetcher,
  context: (extra?: string[], noTags?: boolean) => Promise<UserMessage>
) {
  const registrar = new ToolRegistrar();
  registerNavigationTools(registrar, browser);
  registerHtmlTools(registrar, browser, fetcher, context);
  registerRadioInputTools(registrar, browser, fetcher);
  registerButtonTools(registrar, browser, fetcher);
  registerTextInputTools(registrar, browser, fetcher);
  registerCsvTools(registrar, csv);

  return registrar.finalize();
}
