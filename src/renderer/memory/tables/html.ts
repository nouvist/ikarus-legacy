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

export interface ElementData {
  hash: string;
  signature: string;
  selector: string;
  html: string;
  text: string;
  clusterHash: string;
  clusterIndex: number;
  embedding: number[];
}

export interface ClusterData {
  hash: string;
  signature: string;
  elements: number;
  keywords: string[];
  // description: string;
  embedding: number[];
}

export class HtmlElementTable extends InMemoryTable<ElementData> {
  protected _name = "htmlElement";
  protected _schema = new Schema([
    new Field("hash", new Utf8()),
    new Field("signature", new Utf8()),
    new Field("selector", new Utf8()),
    new Field("html", new Utf8()),
    new Field("text", new Utf8()),
    new Field("clusterHash", new Utf8()),
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

  async findHtmlBySemantic(
    embedding: ElementData["embedding"],
    limit?: number
  ) {
    let query = this.raw.query().nearestTo(embedding);
    if (limit) query = query.limit(limit);
    return (await query.toArray()) as ElementData[];
  }

  async findHtmlsByCluster(clusterHash: ElementData["clusterHash"]) {
    return (await this.raw
      .query()
      .where(`clusterHash == ${clusterHash}`)
      .toArray()) as ElementData[];
  }

  async findHtmlByClusterAndIndex(
    clusterHash: ElementData["clusterHash"],
    index: ElementData["clusterIndex"]
  ) {
    const result = await this.raw
      .query()
      .where(`clusterHash == ${clusterHash} && clusterIndex == ${index}`)
      .limit(1)
      .toArray();
    return result[0] as ElementData | undefined;
  }
}

export class HtmlClusterTable extends InMemoryTable<ClusterData> {
  protected _name = "htmlCluster";
  protected _schema = new Schema([
    new Field("hash", new Utf8()),
    new Field("signature", new Utf8()),
    new Field("elements", new Uint32()),
    new Field("keywords", new List(new Field("item", new Utf8()))),
    // new Field("description", new Utf8()),
    new Field(
      "embedding",
      new FixedSizeList(768, new Field("item", new Float32()))
    ),
  ]);

  constructor(connection: Connection) {
    super(connection);
  }

  async ensureInitialized() {
    await super.ensureInitialized();
  }
}
