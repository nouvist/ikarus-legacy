import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import { UserMessage } from "~/renderer/components/chat/controller/structs";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { ElementData } from "~/renderer/memory/tables/html";

export default function registerHtmlTools(
  registrar: ToolRegistrar,
  browser: BrowserController,
  fetcher: Fetcher,
  context: (extra?: string[], noTags?: boolean) => Promise<UserMessage>
) {
  registrar.register("Html.getSummary", new GetSummaryTool(browser, context));
  registrar.register(
    "Html.findElementsBySemantics",
    new FindElementsBySemanticsTool(browser, fetcher)
  );
  registrar.register(
    "Html.findElementsByCluster",
    new FindElementsByClusterTool(browser, fetcher)
  );
  registrar.register(
    "Html.findClusters",
    new FindClustersTool(browser, fetcher)
  );
  registrar.register(
    "Html.findClustersBySemantics",
    new FindClustersBySemanticsTool(browser, fetcher)
  );
}

export class GetSummaryTool extends Tool {
  protected _browser: BrowserController;
  protected _context: (
    extra?: string[],
    noTags?: boolean
  ) => Promise<UserMessage>;

  protected _description = "Get a summary of the current page.";
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

export class FindElementsBySemanticsTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Find HTML elements by semantics description.";
  protected _parameters = z.object({
    semantics: z.string().describe("Description of the elements to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this._parameters>) {
    const elements = await this._fetcher.html.findElementsBySemantics(
      semantics,
      10
    );
    const lines = elements.map((element) => {
      return [
        `Selector: ${element.selector}`,
        `Raw: ${element.html}`,
        `Text: ${element.text}`,
      ].join("\n");
    });

    lines.unshift(
      `${lines.length} elements listed by the closest from "${semantics}". ` +
        "Use `Html.findElementsByCluster` to get all elements." +
        "Use `Html.findClusters` to get all clusters.",
      "Use other tools to interact with the browser."
    );
    return lines.join("\n\n");
  }
}

export class FindElementsByClusterTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Find HTML elements by cluster.";
  protected _parameters = z.object({
    cluster: z.string().describe("Cluster hash to find elements in."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ cluster }: z.infer<typeof this._parameters>) {
    const elements = await this._fetcher.html.findElementsByCluster(cluster);
    const lines = elements.map((element) => {
      return [
        `Selector: ${element.selector}`,
        `Raw: ${element.html}`,
        `Text: ${element.text}`,
      ].join("\n");
    });

    lines.unshift(`${lines.length} elements found in cluster "${cluster}".`);
    return lines.join("\n\n");
  }
}

export class FindClustersTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Find all HTML clusters.";
  protected _parameters = z.object({});

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute() {
    const clusters = await this._fetcher.html.findClusters();
    const lines = clusters.map((cluster) => {
      return [
        `Hash: ${cluster.hash}`,
        `Keywords: ${Array.from(cluster.keywords).join(", ")}`,
        `Elements: ${cluster.elements}`,
      ].join("\n");
    });

    lines.unshift(`${clusters.length} clusters found.`);
    return lines.join("\n\n");
  }
}

export class FindClustersBySemanticsTool extends Tool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Find HTML clusters by semantics description.";
  protected _parameters = z.object({
    semantics: z.string().describe("Description of the clusters to find."),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantics }: z.infer<typeof this._parameters>) {
    const clusters =
      await this._fetcher.html.findClustersBySemantics(semantics);
    const representatives = [] as (ElementData | undefined)[];
    for (const cluster of clusters) {
      const element = await this._fetcher.html.findElementsByCluster(
        cluster.hash,
        1
      );
      if (element.length > 0) representatives.push(element[0]);
      else representatives.push(undefined);
    }

    const lines = clusters.map((cluster) => {
      return [
        `Hash: ${cluster.hash}`,
        `Keywords: ${Array.from(cluster.keywords).join(", ")}`,
        `Elements: ${cluster.elements}`,
        `Representative: ${representatives.shift()?.html || "None"}`,
      ].join("\n");
    });

    lines.unshift(`${clusters.length} clusters found for "${semantics}".`);
    return lines.join("\n\n");
  }
}
