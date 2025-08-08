import {
  Field,
  FixedSizeList,
  List,
  Float32,
  Schema,
  Utf8,
} from "apache-arrow";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export interface CheckboxInputData {
  hash: string;
  selector: string;
  embedding: number[];
  name: string;
  value: string;
  text: string;
  labels: string[];
  raw: string;
}

export class CheckboxInputTable extends InMemoryTable<CheckboxInputData> {
  protected _name = "checkboxInputs";
  protected _schema = new Schema([
    new Field("hash", new Utf8()),
    new Field("selector", new Utf8()),
    new Field(
      "embedding",
      new FixedSizeList(768, new Field("item", new Float32()))
    ),
    new Field("name", new Utf8()),
    new Field("value", new Utf8()),
    new Field("text", new Utf8()),
    new Field("labels", new List(new Field("item", new Utf8()))),
    new Field("raw", new Utf8()),
  ]);

  async ensureInitialized() {
    await super.ensureInitialized();
    this.findAll = this.findAll.bind(this);
    this.findNearestTo = this.findNearestTo.bind(this);
  }

  async findAll(): Promise<CheckboxInputData[]> {
    return await this.raw.query().toArray();
  }

  async findNearestTo(
    embedding: CheckboxInputData["embedding"],
    limit = 10
  ): Promise<CheckboxInputData[]> {
    return await this.raw.query().nearestTo(embedding).limit(limit).toArray();
  }

  async findByName(name: string): Promise<CheckboxInputData[]> {
    return await this.raw
      .query()
      .where(`\`name\` == ${JSON.stringify(name)}`)
      .toArray();
  }
}

export interface CheckboxInputClusterData {
  name: string;
  options: number;
  semantics: number[];
}

export class CheckboxInputClusterTable extends InMemoryTable<CheckboxInputClusterData> {
  protected _name = "checkboxInputClusters";
  protected _schema = new Schema([
    new Field("name", new Utf8()),
    new Field("options", new FixedSizeList(10, new Field("item", new Utf8()))),
    new Field(
      "semantics",
      new FixedSizeList(10, new Field("item", new Float32()))
    ),
  ]);

  async ensureInitialized() {
    await super.ensureInitialized();
    this.findAll = this.findAll.bind(this);
    this.findNearestTo = this.findNearestTo.bind(this);
    this.findByName = this.findByName.bind(this);
  }

  async findAll(): Promise<CheckboxInputClusterData[]> {
    return await this.raw.query().toArray();
  }

  async findNearestTo(
    semantics: CheckboxInputClusterData["semantics"],
    limit?: number
  ): Promise<CheckboxInputClusterData[]> {
    let query = this.raw.query();
    if (limit) query = query.limit(limit);
    return query.nearestTo(semantics).toArray();
  }

  async findByName(name: string): Promise<CheckboxInputClusterData | undefined> {
    return (
      await this.raw
        .query()
        .where(`\`name\` == ${JSON.stringify(name)}`)
        .toArray()
    )[0];
  }
}
