import {
  Field,
  FixedSizeList,
  List,
  Float32,
  Schema,
  Utf8,
} from "apache-arrow";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export interface SelectData {
  hash: string;
  selector: string;
  labels: string[];
  options: SelectOptionData[];
  raw: string;
  embedding: number[];
}

export interface SelectOptionData {
  value: string;
  text: string;
}

export default class SelectTable extends InMemoryTable<SelectData> {
  protected _name = "selects";
  protected _schema = new Schema([
    new Field("hash", new Utf8()),
    new Field("selector", new Utf8()),
    new Field("labels", new List(new Field("item", new Utf8()))),
    new Field("options", new List(new Field("item", new Utf8()))),
    new Field("raw", new Utf8()),
    new Field(
      "embedding",
      new FixedSizeList(
        RunnerFacade.instance.getTextEmbeddingDimensions(),
        new Field("item", new Float32())
      )
    ),
  ]);

  async ensureInitialized() {
    await super.ensureInitialized();
    this.add = this.add.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findNearestTo = this.findNearestTo.bind(this);
  }

  async add(data: SelectData[]) {
    super.add(
      data.map((it) => ({
        ...it,
        options: it.options.map((option) => JSON.stringify(option)),
      })) as any[]
    );
  }

  async findAll(): Promise<SelectData[]> {
    return (await this.raw.query().toArray()).map((it) => ({
      ...it,
      options: Array.from(it.options as string[]).map(
        (option) => JSON.parse(option) as SelectOptionData
      ),
    }));
  }

  async findNearestTo(
    embedding: SelectData["embedding"],
    limit = 10
  ): Promise<SelectData[]> {
    return (
      await this.raw.query().nearestTo(embedding).limit(limit).toArray()
    ).map((it) => ({
      ...it,
      options: Array.from(it.options as string[]).map(
        (option) => JSON.parse(option) as SelectOptionData
      ),
    }));
  }
}
