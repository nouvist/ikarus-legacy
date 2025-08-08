import type { Connection } from "@lancedb/lancedb";
import ButtonTable from "~/renderer/memory/tables/button";
import {
  HtmlClusterTable,
  HtmlElementTable,
} from "~/renderer/memory/tables/html";
import {
  RadioInputClusterTable,
  RadioInputTable,
} from "~/renderer/memory/tables/radio_input";
import TextInputTable from "~/renderer/memory/tables/text_input";
import lancedb from "~/renderer/node/lancedb";

export default class InMemory {
  protected _isInitialized = false;
  protected _connection?: Connection;

  protected _htmlElement?: HtmlElementTable;
  protected _htmlCluster?: HtmlClusterTable;

  protected _buttons?: ButtonTable;
  protected _textInputs?: TextInputTable;

  protected _radioInputs?: RadioInputTable;
  protected _radioInputClusters?: RadioInputClusterTable;

  constructor() {
    this._throwNotInitializedError = this._throwNotInitializedError.bind(this);
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._connection = await lancedb.connect("memory://");
    this._htmlElement = new HtmlElementTable(this._connection);
    this._htmlCluster = new HtmlClusterTable(this._connection);

    this._buttons = new ButtonTable(this._connection);
    this._textInputs = new TextInputTable(this._connection);

    this._radioInputs = new RadioInputTable(this._connection);
    this._radioInputClusters = new RadioInputClusterTable(this._connection);
    await Promise.all([
      this._htmlElement.ensureInitialized(),
      this._htmlCluster.ensureInitialized(),

      this._buttons.ensureInitialized(),
      this._textInputs.ensureInitialized(),

      this._radioInputs.ensureInitialized(),
      this._radioInputClusters.ensureInitialized(),
    ]);
    this._isInitialized = true;
  }

  protected _throwNotInitializedError() {
    return new Error(
      "InMemory instance is not initialized. Call ensureInitialized first."
    );
  }

  get htmlElement() {
    if (!this._htmlElement) throw this._throwNotInitializedError();
    return this._htmlElement;
  }

  get htmlCluster() {
    if (!this._htmlCluster) throw this._throwNotInitializedError();
    return this._htmlCluster;
  }

  get buttons() {
    if (!this._buttons) throw this._throwNotInitializedError();
    return this._buttons;
  }

  get textInputs() {
    if (!this._textInputs) throw this._throwNotInitializedError();
    return this._textInputs;
  }

  get radioInputs() {
    if (!this._radioInputs) throw this._throwNotInitializedError();
    return this._radioInputs;
  }

  get radioInputClusters() {
    if (!this._radioInputClusters) throw this._throwNotInitializedError();
    return this._radioInputClusters;
  }
}
