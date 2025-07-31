import type { Connection, SchemaLike, Table } from "@lancedb/lancedb";

export default abstract class InMemoryTable<T = object> {
  protected _connection: Connection;
  private _raw?: Table;

  protected abstract _name: string;
  protected abstract _schema: SchemaLike;

  constructor(connection: Connection) {
    this._connection = connection;
    this.ensureInitialized = this.ensureInitialized.bind(this);
  }

  get name() {
    return this._name;
  }

  get raw() {
    if (!this._raw) {
      throw new Error(
        `Table ${this._name} is not initialized. Call ensureInitialized first.`
      );
    }
    return this._raw;
  }

  async ensureInitialized() {
    this._raw = await this._connection.createEmptyTable(
      this._name,
      this._schema
    );
  }

  async add(data: T[]) {
    await this.raw.add(data as any[]);
  }

  async clear() {
    await this.raw.delete("true");
  }
}
