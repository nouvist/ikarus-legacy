import type { Connection } from "@lancedb/lancedb";
import {
  Field,
  FixedSizeList,
  Float32,
  List,
  Schema,
  Uint32,
  Utf8,
} from "apache-arrow";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export interface HtmlData {
  hash: number;
  signature: string;
  selector: string;
  html: string;
  text: string;
  clusterHash: number;
  clusterKeywords: string[];
  clusterIndex: number;
  embedding: number[];
}

export default class HtmlTable extends InMemoryTable<HtmlData> {
  protected _name = "html";
  protected _schema = new Schema([
    new Field("hash", new Uint32()),
    new Field("signature", new Utf8()),
    new Field("selector", new Utf8()),
    new Field("html", new Utf8()),
    new Field("text", new Utf8()),
    new Field("clusterHash", new Uint32()),
    new Field("clusterKeywords", new List(new Field("item", new Utf8()))),
    new Field("clusterIndex", new Uint32()),
    new Field(
      "embedding",
      new FixedSizeList(768, new Field("item", new Float32()))
    ),
  ]);

  constructor(connection: Connection) {
    super(connection);
    this.findHtmlBySemantic = this.findHtmlBySemantic.bind(this);
    this.findHtmlsByCluster = this.findHtmlsByCluster.bind(this);
    this.findHtmlByClusterAndIndex = this.findHtmlByClusterAndIndex.bind(this);
  }

  async ensureInitialized() {
    await super.ensureInitialized();
  }

  async findHtmlBySemantic(embedding: HtmlData["embedding"], limit?: number) {
    let query = this.raw.query().nearestTo(embedding);
    if (limit) query = query.limit(limit);
    return (await query.toArray()) as HtmlData[];
  }

  async findHtmlsByCluster(clusterHash: number) {
    return (await this.raw
      .query()
      .where(`clusterHash == ${clusterHash}`)
      .toArray()) as HtmlData[];
  }

  async findHtmlByClusterAndIndex(clusterHash: number, index: number) {
    const result = await this.raw
      .query()
      .where(`clusterHash == ${clusterHash} && clusterIndex == ${index}`)
      .limit(1)
      .toArray();
    return result[0] as HtmlData | undefined;
  }
}
