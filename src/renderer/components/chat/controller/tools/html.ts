import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { ElementData } from "~/renderer/memory/tables/html";
import { RefCell } from "~/shared/core";

export default function registerHtmlTools(
  registrar: ToolRegistrar,
  browser: RefCell<BrowserController>,
  fetcher: Fetcher
) {
  registrar.register(
    "Html.findBySemantic",
    new GetBySemanticHtmlTool(browser, fetcher)
  );
  registrar.register(
    "Html.findByCluster",
    new GetHtmlsByCluster(browser, fetcher)
  );
  registrar.register(
    "Html.findByClusterAndIndex",
    new GetHtmlByClusterAndIndexTool(browser, fetcher)
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
      `Cluster Keywords: ${element.clusterKeywords}`,
      `Selector: ${element.selector}`,
      `HTML: ${element.html}`,
      `Text: ${element.text}`,
    ].join("\n");
  }
}

export class GetBySemanticHtmlTool extends _HtmlTool {
  protected _browser: RefCell<BrowserController>;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by semantic similarity";
  protected _parameters = z.object({
    semantic: z
      .string()
      .describe("The semantic query to search for HTML content"),
  });

  constructor(browser: RefCell<BrowserController>, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ semantic }: z.infer<typeof this._parameters>) {
    const htmls = await this._fetcher.findHtmlBySemantic(semantic, 10);

    return htmls.map(this._formatElement).join("\n\n");
  }
}

export class GetHtmlsByCluster extends _HtmlTool {
  protected _browser: RefCell<BrowserController>;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by cluster hash";
  protected _parameters = z.object({
    clusterHash: z.string().describe("The hash of the cluster"),
  });

  constructor(browser: RefCell<BrowserController>, fetcher: Fetcher) {
    super();
    this._browser = browser;
    this._fetcher = fetcher;
  }

  async execute({ clusterHash }: z.infer<typeof this._parameters>) {
    const htmls = await this._fetcher.findHtmlsByCluster(clusterHash);
    return htmls.map(this._formatElement).join("\n");
  }
}

export class GetHtmlByClusterAndIndexTool extends _HtmlTool {
  protected _browser: RefCell<BrowserController>;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by cluster hash and index";
  protected _parameters = z.object({
    clusterHash: z.string().describe("The hash of the cluster"),
    index: z.number().describe("The index of the HTML in the cluster"),
  });

  constructor(browser: RefCell<BrowserController>, fetcher: Fetcher) {
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
