import {
  Field,
  FixedSizeList,
  Float32,
  Schema,
  Uint32,
  Utf8,
} from "apache-arrow";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export interface HtmlData {
  selector: string;
  raw: string;
  text: string;
  hash: number;
  signature: string;
  clusterHash?: number;
  clusterLabel?: string;
  embedding: number[];
}

export default class HtmlTable extends InMemoryTable<HtmlData> {
  protected _name = "html";
  protected _schema = new Schema([
    new Field("selector", new Utf8()),
    new Field("raw", new Utf8()),
    new Field("text", new Utf8()),
    new Field("hash", new Uint32()),
    new Field("signature", new Utf8()),
    new Field("clusterHash", new Uint32(), true),
    new Field("clusterLabel", new Utf8(), true),
    new Field(
      "embedding",
      new FixedSizeList(768, new Field("item", new Float32()))
    ),
  ]);

  async ensureInitialized() {
    await super.ensureInitialized();
  }

  async getAll() {
    return (await this.raw.query().toArray()) as HtmlData[];
  }
}
