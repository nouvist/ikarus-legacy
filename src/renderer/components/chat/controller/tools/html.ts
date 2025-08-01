import z from "zod";
import { BrowserController } from "~/renderer/components/browser";
import Fetcher from "~/renderer/components/chat/controller/fetcher";
import {
  Tool,
  ToolRegistrar,
} from "~/renderer/components/chat/controller/tools/fundamental";
import { raw, RefCell } from "~/shared/core";

export default function registerHtmlTools(
  registrar: ToolRegistrar,
  browser: RefCell<BrowserController>,
  fetcher: Fetcher
) {
  registrar.register(
    "Html.getBySemantic",
    new GetBySemanticHtmlTool(browser, fetcher)
  );
  registrar.register(
    "Html.getByClusterAndIndex",
    new GetHtmlByClusterAndIndexTool(browser, fetcher)
  );
}

export class GetBySemanticHtmlTool extends Tool {
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

    return htmls
      .map((html) =>
        raw(`
          Cluster Hash: ${html.clusterHash}
          Cluster Keywords: ${html.clusterKeywords}
          Selector: ${html.selector}
          HTML: ${html.html}
          Text: ${html.text}
        `)
      )
      .join("\n");
  }
}

export class GetHtmlByClusterAndIndexTool extends Tool {
  protected _browser: RefCell<BrowserController>;
  protected _fetcher: Fetcher;
  protected _description = "Get HTML content by cluster hash and index";
  protected _parameters = z.object({
    clusterHash: z.number().describe("The hash of the cluster"),
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
    return raw(`
      Cluster Hash: ${html.clusterHash}
      Cluster Keywords: ${html.clusterKeywords}
      Selector: ${html.selector}
      HTML: ${html.html}
      Text: ${html.text}
    `);
  }
}
