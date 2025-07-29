import { BrowserController } from "~/renderer/components/browser";
import ButtonFetcher from "~/renderer/components/chat/controller/fetcher/button";
import TextInputFetcher from "~/renderer/components/chat/controller/fetcher/text_input";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { RefCell } from "~/shared/core";
import { Mutex } from "~/shared/rxjs";

export default class Fetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;
  protected _mutex = new Mutex();

  protected _button: ButtonFetcher;
  protected _textInput: TextInputFetcher;

  // TODO: gak berguna
  readonly mutex = this._mutex.asImmutable();

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    this._button = new ButtonFetcher(
      this._browser,
      this._memory,
      this._runner,
      this._mutex
    );

    this._textInput = new TextInputFetcher(
      this._browser,
      this._memory,
      this._runner,
      this._mutex
    );

    this.fetchAll = this.fetchAll.bind(this);
  }

  async fetchAll() {
    const abort = new AbortController();
    const subscription = this._mutex.subscribe((locked) => {
      if (locked) return;
      console.log("[Runner::fetchAll] cancel diterima...");
      abort.abort();
    });

    console.log("[Runner::fetchAll] mulai ambil data...");
    await Promise.all([
      this.fetchButtons(abort.signal),
      this.fetchTextInputs(abort.signal),
    ]);

    console.log("[Runner::fetchAll] selesai ambil data!");
    subscription.unsubscribe();
  }

  get findButton() {
    return this._button.findButton;
  }

  get fetchButtons() {
    return this._button.fetchButtons;
  }

  get findTextInput() {
    return this._textInput.findTextInput;
  }

  get fetchTextInputs() {
    return this._textInput.fetchTextInputs;
  }
}
