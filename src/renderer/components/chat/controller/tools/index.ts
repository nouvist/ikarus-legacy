import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import { UserMessage } from "~/renderer/components/chat/controller/structs";
import registerButtonTools from "~/renderer/components/chat/controller/tools/button";
import registerCheckboxInputTools from "~/renderer/components/chat/controller/tools/checkbox_input";
import registerCsvTools from "~/renderer/components/chat/controller/tools/csv";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
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

  registrar.register("Core.getSummary", new GetSummaryTool(browser, context));
  registerNavigationTools(registrar, browser);
  registerHtmlTools(registrar, browser, fetcher);
  registerRadioInputTools(registrar, browser, fetcher);
  registerCheckboxInputTools(registrar, browser, fetcher);
  registerButtonTools(registrar, browser, fetcher);
  registerTextInputTools(registrar, browser, fetcher);
  registerCsvTools(registrar, csv);

  return registrar.finalize();
}

export class GetSummaryTool extends Tool {
  protected _browser: BrowserController;
  protected _context: (
    extra?: string[],
    noTags?: boolean
  ) => Promise<UserMessage>;

  protected _description = "Get a summary.";
  protected _parameters = z.object({});

  constructor(
    browser: BrowserController,
    context: (extra?: string[], noTags?: boolean) => Promise<UserMessage>
  ) {
    super();
    this._browser = browser;
    this._context = context;
  }

  async execute() {
    const message = await this._context(undefined, true);
    return message.content;
  }
}
