import { Field, FixedSizeList, Float32, Schema, Utf8 } from "apache-arrow";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import InMemoryTable from "~/renderer/memory/tables/abstract";

export enum ButtonDataType {
  Button = "button",
  Anchor = "a",
}

export interface ButtonData {
  hash: string;
  tag: ButtonDataType;
  text: string;
  href?: string;
  selector: string;
  embedding: number[];
}

export default class ButtonTable extends InMemoryTable<ButtonData> {
  protected _name = "buttons";
  protected _schema = new Schema([
    new Field("hash", new Utf8()),
    new Field("tag", new Utf8()),
    new Field("text", new Utf8()),
    new Field("href", new Utf8(), true),
    new Field("selector", new Utf8()),
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
  }

  async findAll(): Promise<ButtonData[]> {
    return await this.raw.query().toArray();
  }

  async findNearestTo(
    embedding: ButtonData["embedding"],
    limit = 10
  ): Promise<ButtonData[]> {
    return await this.raw.query().nearestTo(embedding).limit(limit).toArray();
  }

  async remove(hash: ButtonData["hash"]): Promise<void> {
    await this.raw.delete(`\`hash\` == ${JSON.stringify(hash)}`);
  }
}
