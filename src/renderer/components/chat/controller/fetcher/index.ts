import { BrowserController } from "~/renderer/components/browser";
import ButtonFetcher from "~/renderer/components/chat/controller/fetcher/button";
import CheckboxInputFetcher from "~/renderer/components/chat/controller/fetcher/checkbox_input";
import HtmlFetcher from "~/renderer/components/chat/controller/fetcher/html";
import RadioInputFetcher from "~/renderer/components/chat/controller/fetcher/radio_input";
import SelectFetcher from "~/renderer/components/chat/controller/fetcher/select";
import TextInputFetcher from "~/renderer/components/chat/controller/fetcher/text_input";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { RefCell } from "~/shared/core";

export default class Fetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;

  readonly html: HtmlFetcher;
  readonly radio: RadioInputFetcher;
  readonly checkbox: CheckboxInputFetcher;
  readonly button: ButtonFetcher;
  readonly text: TextInputFetcher;
  readonly select: SelectFetcher;

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    const args = [this._browser, this._memory, this._runner] as const;
    this.html = new HtmlFetcher(...args);
    this.radio = new RadioInputFetcher(...args);
    this.checkbox = new CheckboxInputFetcher(...args);
    this.button = new ButtonFetcher(...args);
    this.text = new TextInputFetcher(...args);
    this.select = new SelectFetcher(...args);
  }
}
