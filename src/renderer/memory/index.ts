import type { Connection } from "@lancedb/lancedb";
import ButtonTable from "~/renderer/memory/tables/button";
import HtmlTable from "~/renderer/memory/tables/html";
import TextInputTable from "~/renderer/memory/tables/text_input";
import lancedb from "~/renderer/node/lancedb";

export default class InMemory {
  protected _isInitialized = false;
  protected _connection?: Connection;
  protected _html?: HtmlTable;
  protected _buttons?: ButtonTable;
  protected _textInputs?: TextInputTable;

  constructor() {
    this._throwNotInitializedError = this._throwNotInitializedError.bind(this);
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._connection = await lancedb.connect("memory://");
    this._html = new HtmlTable(this._connection);
    this._buttons = new ButtonTable(this._connection);
    this._textInputs = new TextInputTable(this._connection);
    await Promise.all([
      this._html.ensureInitialized(),
      this._buttons.ensureInitialized(),
      this._textInputs.ensureInitialized(),
    ]);
    this._isInitialized = true;
  }

  protected _throwNotInitializedError() {
    return new Error(
      "InMemory instance is not initialized. Call ensureInitialized first."
    );
  }

  get html() {
    if (!this._html) throw this._throwNotInitializedError();
    return this._html;
  }

  get buttons() {
    if (!this._buttons) throw this._throwNotInitializedError();
    return this._buttons;
  }

  get textInputs() {
    if (!this._textInputs) throw this._throwNotInitializedError();
    return this._textInputs;
  }
}
