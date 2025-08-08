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
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
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
      new FixedSizeList(
        RunnerFacade.instance.getTextEmbeddingDimensions(),
        new Field("item", new Float32())
      )
    ),
  ]);

  constructor(connection: Connection) {
    super(connection);
    this.findByCluster = this.findByCluster.bind(this);
    this.findBySemantics = this.findBySemantics.bind(this);
    this.findByClusterAndIndex = this.findByClusterAndIndex.bind(this);
  }

  async ensureInitialized() {
    await super.ensureInitialized();
  }

  async findBySemantics(
    embedding: ElementData["embedding"],
    limit?: number
  ): Promise<ElementData[]> {
    let query = this.raw.query().nearestTo(embedding);
    if (limit) query = query.limit(limit);
    return await query.toArray();
  }

  async findByCluster(
    clusterHash: ElementData["clusterHash"],
    limit?: number
  ): Promise<ElementData[]> {
    let query = this.raw
      .query()
      .where(`\`clusterHash\` == ${JSON.stringify(clusterHash)}`);
    if (limit) query = query.limit(limit);
    return await query.toArray();
  }

  async findByClusterAndIndex(
    clusterHash: ElementData["clusterHash"],
    index: ElementData["clusterIndex"]
  ): Promise<ElementData | undefined> {
    const result = await this.raw
      .query()
      .where(
        `\`clusterHash\` == ${JSON.stringify(clusterHash)} && \`clusterIndex\` == ${JSON.stringify(index)}`
      )
      .limit(1)
      .toArray();
    return result[0];
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
      new FixedSizeList(
        RunnerFacade.instance.getTextEmbeddingDimensions(),
        new Field("item", new Float32())
      )
    ),
  ]);

  constructor(connection: Connection) {
    super(connection);
  }

  async ensureInitialized() {
    await super.ensureInitialized();
  }

  async findAll(): Promise<ClusterData[]> {
    return await this.raw.query().toArray();
  }

  async findBySemantics(
    embedding: ClusterData["embedding"],
    limit?: number
  ): Promise<ClusterData[]> {
    let query = this.raw.query().nearestTo(embedding);
    if (limit) query = query.limit(limit);
    return await query.toArray();
  }
}
