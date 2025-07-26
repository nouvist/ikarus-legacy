import type { Connection } from "@lancedb/lancedb";
import ButtonTable from "~/renderer/memory/tables/button";

// NodeJS imports
const lancedb =
  require("@lancedb/lancedb") as typeof import("@lancedb/lancedb");

export default class InMemory {
  protected _isInitialized = false;
  protected _connection?: Connection;
  protected _buttons?: ButtonTable;

  constructor() {
    this._throwNotInitializedError = this._throwNotInitializedError.bind(this);
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._connection = await lancedb.connect("memory://");
    this._buttons = new ButtonTable(this._connection);
    await this._buttons.ensureInitialized();
    this._isInitialized = true;
  }

  protected _throwNotInitializedError() {
    return new Error(
      "InMemory instance is not initialized. Call ensureInitialized first."
    );
  }

  get buttons() {
    if (!this._buttons) throw this._throwNotInitializedError();
    return this._buttons;
  }
}
