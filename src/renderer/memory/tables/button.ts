import {
  Field,
  FixedSizeList,
  Float32,
  Schema,
  Uint32,
  Utf8
} from "apache-arrow";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export enum ButtonDataType {
  Button = "button",
  Anchor = "anchor",
}

export interface ButtonData {
  selector: string;
  type: ButtonDataType;
  text: string;
  hash: number;
  href?: string;
  embedding: number[];
}

export default class ButtonTable extends InMemoryTable<ButtonData> {
  protected _name = "buttons";
  protected _schema = new Schema([
    new Field("selector", new Utf8()),
    new Field("type", new Utf8()),
    new Field("text", new Utf8()),
    new Field("hash", new Uint32()),
    new Field("href", new Utf8(), true),
    new Field(
      "embedding",
      new FixedSizeList(768, new Field("item", new Float32()))
    ),
  ]);

  async ensureInitialized() {
    await super.ensureInitialized();
    // this._table.createIndex("embedding", {
    //   config: lancedb.Index.ivfFlat({
    //     distanceType: "cosine",
    //   }),
    // });
  }

  async getAll() {
    return (await this._table.query().toArray()) as ButtonData[];
  }

  async findNearestTo(embedding: ButtonData["embedding"], limit = 10) {
    return (await this._table
      .query()
      .nearestTo(embedding)
      .limit(limit)
      .toArray()) as ButtonData[];
  }

  async remove(hash: ButtonData["hash"]) {
    await this._table.delete(`hash == ${hash}`);
  }
}
