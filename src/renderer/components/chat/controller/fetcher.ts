import { BrowserController } from "~/renderer/components/browser";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { ButtonDataType } from "~/renderer/memory/tables/button";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";
import { Mutex } from "~/shared/rxjs";

export default class Fetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;
  protected _mutex = new Mutex(true);

  readonly mutex = this._mutex.asImmutable();

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    this.findButton = this.findButton.bind(this);
    this.fetchAll = this.fetchAll.bind(this);
    this.fetchButtons = this.fetchButtons.bind(this);
  }

  async findButton(semantics: string, limit = 10) {
    const { embedding } = await this._runner.embed(semantics);
    return this._memory.buttons.findNearestTo(embedding, limit);
  }

  async fetchAll() {
    console.log("[Runner::fetchAll] mau ngambil data...");
    if (this._mutex.isLocked) {
      console.log("[Runner::fetchAll] cancel yang udah ada...");
      this._mutex.unlock();
    }

    const abort = new AbortController();
    const subscription = this._mutex.subscribe((locked) => {
      if (locked) return;
      console.log("[Runner::fetchAll] cancel diterima...");
      abort.abort();
    });

    console.log("[Runner::fetchAll] mulai ambil data...");
    await this.fetchButtons(abort.signal);

    console.log("[Runner::fetchAll] selesai ambil data!");
    this._mutex.next(true);
    subscription.unsubscribe();
  }

  async fetchButtons(abortSignal?: AbortSignal) {
    const dom = await this._browser.value.managed.dom();
    const buttons = Array.from(
      dom.querySelectorAll("button, a, input[type='submit']")
    )
      .filter((el) => {
        const lower = el.tagName.toLowerCase();
        return (
          (lower === "button" ||
            lower === "a" ||
            (lower === "input" && el.getAttribute("type") === "submit")) &&
          (el.textContent?.length ?? 0) > 0
        );
      })
      .map((element) => {
        const selector = HtmlUtils.getSelectorFromElement(element);
        const hash = HtmlUtils.getHashFromElement(element);
        let text = element.textContent?.trim() || "";
        while (text.includes("\n")) text = text.replace("\n", " ");
        while (text.includes("  ")) text = text.replace("  ", " ");
        return {
          text,
          element,
          selector,
          hash,
        };
      })
      .filter(({ text }) => text.length > 0)
      .sort((a, b) => a.selector.localeCompare(b.selector));
    if (abortSignal?.aborted) return;

    console.log(`[Fetcher::fetchButtons] found ${buttons.length} buttons`);

    for (let i = 0; i < buttons.length; i++) {
      const current = buttons[i];
      for (let j = i + 1; j < buttons.length; j++) {
        const other = buttons[j];

        if (other.element.querySelector(current.selector)) {
          buttons.splice(i, 1);
          i--;
          break;
        }
      }
    }
    if (abortSignal?.aborted) return;
    console.log(`[Fetcher::fetchButtons] filtered ${buttons.length} buttons`);

    let existings = await this._memory.buttons.getAll();

    console.log(existings.map((b) => b.hash));
    console.log(buttons.map((b) => b.hash));
    let removed = 0;
    for (const cursor of existings) {
      if (abortSignal?.aborted) break;
      if (buttons.some((b) => b.hash === cursor.hash)) continue;
      this._memory.buttons.remove(cursor.hash);
      removed++;
    }
    console.log(`[Fetcher::fetchButtons] found ${existings.length} existings`);
    console.log(`[Fetcher::fetchButtons] removed ${removed} existings`);

    for (let i = 0; i < buttons.length; i++) {
      const cursor = buttons[i];
      if (!existings.some((b) => b.hash === cursor.hash)) continue;
      buttons.splice(i, 1);
      i--;
    }

    if (abortSignal?.aborted) return;
    if (buttons.length === 0) {
      console.log("[Fetcher::fetchButtons] no new buttons to add");
      return;
    }

    console.log(`[Fetcher::fetchButtons] should add ${buttons.length}`);
    console.log(`[Fetcher::fetchButtons] embedding buttons...`);
    const { embeddings } = await this._runner.embedMany(
      buttons.map(({ text }) => text),
      abortSignal
    );

    console.log(`[Fetcher::fetchButtons] adding buttons to memory...`);
    await this._memory.buttons.add(
      buttons.map((button, index) => ({
        selector: button.selector,
        type:
          button.element.tagName.toLowerCase() === "a"
            ? ButtonDataType.Anchor
            : ButtonDataType.Button,
        text: button.text,
        hash: button.hash,
        href: (button.element as HTMLAnchorElement).href as string | undefined,
        embedding: embeddings[index],
      }))
    );
    console.log(`[Fetcher::fetchButtons] buttons added to memory`);
  }
}
