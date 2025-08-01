import {
  Field,
  FixedSizeList,
  Float32,
  Schema,
  Utf8
} from "apache-arrow";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export enum TextInputDataType {
  Input = "input",
  TextArea = "textarea",
}

export interface TextInputData {
  hash: string;
  tag: TextInputDataType;
  type?: string;
  label?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  selector: string;
  embedding: number[];
}

export default class TextInputTable extends InMemoryTable<TextInputData> {
  protected _name = "text_inputs";
  protected _schema = new Schema([
    new Field("hash", new Utf8()),
    new Field("tag", new Utf8()),
    new Field("type", new Utf8(), true),
    new Field("label", new Utf8(), true),
    new Field("id", new Utf8(), true),
    new Field("name", new Utf8(), true),
    new Field("placeholder", new Utf8(), true),
    new Field("selector", new Utf8()),
    new Field(
      "embedding",
      new FixedSizeList(768, new Field("item", new Float32()))
    ),
  ]);

  async ensureInitialized() {
    await super.ensureInitialized();
  }

  async getAll() {
    return (await this.raw.query().toArray()) as TextInputData[];
  }

  async findNearestTo(embedding: TextInputData["embedding"], limit = 10) {
    return (await this.raw
      .query()
      .nearestTo(embedding)
      .limit(limit)
      .toArray()) as TextInputData[];
  }

  async remove(hash: TextInputData["hash"]) {
    await this.raw.delete(`hash == ${hash}`);
  }
}
