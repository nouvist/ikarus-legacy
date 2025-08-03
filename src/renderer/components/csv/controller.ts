import Papa from "papaparse";
import { useEffect, useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { Rxjs } from "~/shared/rxjs";

export function useCsvController() {
  const ref = useRef<CsvController>(null);
  ref.current ??= new CsvController();
  useEffect(() => {
    ref.current!.register();
    return () => ref.current!.dispose();
  }, []);
  return ref.current!;
}

export class CsvData {
  readonly file: File;
  protected _csv?: Papa.ParseResult<Record<string, string>>;

  constructor(file: File) {
    this.file = file;
    this.parse = this.parse.bind(this);
  }

  parse(): Promise<Papa.ParseResult<Record<string, string>>> {
    if (this._csv) return Promise.resolve(this._csv);
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(this.file, {
        header: true,
        skipEmptyLines: true,
        error: reject,
        complete: (results) => {
          this._csv = results;
          console.log("[CsvData] parse", results);
          resolve(results);
        },
      });
    });
  }
}

export class CsvController {
  protected _data = new BehaviorSubject<CsvData | undefined>(undefined);
  protected _drag = new BehaviorSubject<boolean>(false);
  protected _timeout?: NodeJS.Timeout;

  readonly data = Rxjs.asImmutable(this._data);
  readonly subject = Rxjs.asImmutable(this._drag);

  constructor() {
    console.log("CsvController initialized");
    this._drag.subscribe((value) => {
      console.log("CSV drag state changed:", value);
    });
    this.register = this.register.bind(this);
    this.dispose = this.dispose.bind(this);
    this.clear = this.clear.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
  }

  register() {
    window.addEventListener("dragover", this._handleDragOver);
    window.addEventListener("dragleave", this._handleDragLeave);
    window.addEventListener("drop", this._handleDrop);
  }

  dispose() {
    window.removeEventListener("dragover", this._handleDragOver);
    window.removeEventListener("dragleave", this._handleDragLeave);
    window.removeEventListener("drop", this._handleDrop);
  }

  clear() {
    this._data.next(undefined);
  }

  parse(): Promise<Papa.ParseResult<Record<string, string>> | undefined> {
    if (!this._data.value) return Promise.resolve(undefined);
    return this._data.value.parse();
  }

  private _handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (this._drag.value) return;
    console.log("[CsvController] drag over");
    this._drag.next(true);
    clearTimeout(this._timeout);
    this._timeout = setTimeout(this._handleDragLeave, 1000);
  }

  private _handleDragLeave(event?: DragEvent) {
    event?.preventDefault();
    if (!this._drag.value) return;
    console.log("[CsvController] drag leave");
    this._drag.next(false);
  }

  private async _handleDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    if (event.dataTransfer.files.length === 0) return;
    const file = event.dataTransfer.files[0];
    this._drag.next(false);

    if (file.type !== "text/csv") {
      console.warn("[CsvController] bukan csv");
      return;
    }

    console.log("[CsvController]", file);
    this._data.next(new CsvData(file));
  }
}
