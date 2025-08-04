import { BrowserController } from "~/renderer/components/browser";
import ButtonFetcher from "~/renderer/components/chat/controller/fetcher/button";
import HtmlFetcher from "~/renderer/components/chat/controller/fetcher/html";
import TextInputFetcher from "~/renderer/components/chat/controller/fetcher/text_input";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { RefCell } from "~/shared/core";

export default class Fetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;

  protected _html: HtmlFetcher;
  protected _button: ButtonFetcher;
  protected _textInput: TextInputFetcher;

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    const args = [this._browser, this._memory, this._runner] as const;
    this._html = new HtmlFetcher(...args);
    this._button = new ButtonFetcher(...args);
    this._textInput = new TextInputFetcher(...args);
  }

  get findElementsBySemantic() {
    return this._html.findElementsBySemantic;
  }

  get findElementsByCluster() {
    return this._html.findElementsByCluster;
  }

  get findElementByClusterAndIndex() {
    return this._html.findElementByClusterAndIndex;
  }

  get findClusters() {
    return this._html.findClusters;
  }

  get findClustersBySemantic() {
    return this._html.findClustersBySemantic;
  }

  get fetchHtmls() {
    return this._html.fetchHtmlsIfNeeded;
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
