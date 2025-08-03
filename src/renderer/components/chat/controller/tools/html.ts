import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { ElementData } from "~/renderer/memory/tables/html";

export default function registerHtmlTools(
  registrar: ToolRegistrar,
  browser: BrowserController,
  fetcher: Fetcher
) {
  registrar.register(
    "Html.findElementBySemantic",
    new FindElementBySemanticTool(browser, fetcher)
  );
  registrar.register(
    "Html.findElementsByCluster",
    new FindElementsByClusterTool(browser, fetcher)
  );
  registrar.register(
    "Html.findElementByClusterAndIndex",
    new FindElementByClusterAndIndexTool(browser, fetcher)
  );
}

abstract class _HtmlTool extends Tool {
  constructor() {
    super();
    this._formatElement = this._formatElement.bind(this);
  }

  protected _formatElement(element: ElementData): string {
    return [
      `Cluster Hash: ${element.clusterHash}`,
      `Selector: ${element.selector}`,
      `HTML: ${element.html}`,
      `Text: ${element.text}`,
    ].join("\n");
  }
}

export class FindElementBySemanticTool extends _HtmlTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by semantic similarity";
  protected _parameters = z.object({
    semantic: z
      .string()
      .describe("The semantic query to search for HTML content"),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantic }: z.infer<typeof this._parameters>) {
    const htmls = await this._fetcher.findHtmlBySemantic(semantic, 10);

    return htmls.map(this._formatElement).join("\n\n");
  }
}

export class FindElementsByClusterTool extends _HtmlTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by cluster hash";
  protected _parameters = z.object({
    clusterHash: z.string().describe("The hash of the cluster"),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ clusterHash }: z.infer<typeof this._parameters>) {
    const htmls = await this._fetcher.findHtmlsByCluster(clusterHash);
    return htmls.map(this._formatElement).join("\n");
  }
}

export class FindElementByClusterAndIndexTool extends _HtmlTool {
  protected _browser: BrowserController;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by cluster hash and index";
  protected _parameters = z.object({
    clusterHash: z.string().describe("The hash of the cluster"),
    index: z.number().describe("The index of the HTML in the cluster"),
  });

  constructor(browser: BrowserController, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ clusterHash, index }: z.infer<typeof this._parameters>) {
    const html = await this._fetcher.findHtmlByClusterAndIndex(
      clusterHash,
      index
    );
    if (!html) return "No HTML found for the given cluster hash and index.";
    return this._formatElement(html);
  }
}
