import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import { UserMessage } from "~/renderer/components/chat/controller/structs";
import createButtonTools from "~/renderer/components/chat/controller/tools/button";
import createCheckboxInputTools from "~/renderer/components/chat/controller/tools/checkbox_input";
import registerCsvTools from "~/renderer/components/chat/controller/tools/csv";
import { ManagedTool } from "~/renderer/components/chat/controller/tools/fundamental";
import createHtmlTools from "~/renderer/components/chat/controller/tools/html";
import createNavigationTools from "~/renderer/components/chat/controller/tools/navigation";
import createRadioInputTools from "~/renderer/components/chat/controller/tools/radio_input";
import createSelectTools from "~/renderer/components/chat/controller/tools/select";
import createTextInputTools from "~/renderer/components/chat/controller/tools/text_input";
import { CsvController } from "~/renderer/components/csv";

export type Tools = ReturnType<typeof createTools>;
export default function createTools(
  browser: BrowserController,
  csv: CsvController,
  fetcher: Fetcher,
  context: (extra?: string[], noTags?: boolean) => Promise<UserMessage>
) {
  return {
    "Core.getSummary": new GetSummaryTool(browser, context).toTool(),
    ...createNavigationTools(browser),
    ...createHtmlTools(browser, fetcher),
    ...createRadioInputTools(browser, fetcher),
    ...createCheckboxInputTools(browser, fetcher),
    ...createButtonTools(browser, fetcher),
    ...createTextInputTools(browser, fetcher),
    ...createSelectTools(browser, fetcher),
    ...registerCsvTools(csv),
  } as const;
}

export class GetSummaryTool extends ManagedTool {
  protected _browser: BrowserController;
  protected _context: (
    extra?: string[],
    noTags?: boolean
  ) => Promise<UserMessage>;

  description = "Get a summary.";
  input = z.object({});

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
