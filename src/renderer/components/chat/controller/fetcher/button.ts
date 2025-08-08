import { BrowserController } from "~/renderer/components/browser";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { ButtonDataType } from "~/renderer/memory/tables/button";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

export default class ButtonFetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    this.findButton = this.findButton.bind(this);
    this.fetchButtons = this.fetchButtons.bind(this);
  }

  async findButton(semantics: string, limit = 10) {
    const embedding = await this._runner.embed(semantics);
    return this._memory.buttons.findNearestTo(embedding, limit);
  }

  async fetchButtons(abortSignal?: AbortSignal) {
    const dom = await this._browser.value.dom();
    const buttons = Array.from(
      dom.querySelectorAll(
        "button, a, input[type='submit'], input[type='button'], input[type='reset']"
      )
    )
      .filter((el) => {
        const value = el.getAttribute("hidden");
        return value === "false" || !value;
      })
      .map((element) => {
        const selector = HtmlUtils.getElementSelector(element);
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
    console.log(`[ButtonFetcher] nemu ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      const child = buttons[i];
      for (let j = i + 1; j < buttons.length; j++) {
        const parent = buttons[j];
        if (HtmlUtils.isParentOf(child.element, parent.element)) {
          buttons.splice(i, 1);
          i--;
          break;
        } else if (HtmlUtils.isParentOf(parent.element, child.element)) {
          buttons.splice(j, 1);
          j--;
        }
      }
    }
    console.log(`[ButtonFetcher] filter ${buttons.length}`);

    let existings = await this._memory.buttons.getAll();
    let removed = 0;
    for (const cursor of existings) {
      if (abortSignal?.aborted) break;
      if (buttons.some((b) => b.hash === cursor.hash)) continue;
      await this._memory.buttons.remove(cursor.hash);
      removed++;
    }
    console.log(`[ButtonFetcher] ada ${existings.length} dari db`);
    console.log(`[ButtonFetcher] hapus ${removed} dari db`);

    for (let i = 0; i < buttons.length; i++) {
      const cursor = buttons[i];
      if (!existings.some((b) => b.hash === cursor.hash)) continue;
      buttons.splice(i, 1);
      i--;
    }

    if (abortSignal?.aborted) return;
    if (buttons.length === 0) {
      console.log("[ButtonFetcher] gak ada button baru");
      return;
    }

    console.log(`[ButtonFetcher] embedding...`);
    const embeddings = await this._runner.embedMany(
      buttons.map(({ text }) => text),
      abortSignal
    );

    console.log(`[ButtonFetcher] nambahin...`);
    await this._memory.buttons.add(
      buttons.map((button, index) => ({
        selector: button.selector,
        tag:
          button.element.tagName.toLowerCase() === "a"
            ? ButtonDataType.Anchor
            : ButtonDataType.Button,
        text: button.text,
        hash: button.hash,
        href: (button.element as HTMLAnchorElement).href as string | undefined,
        embedding: embeddings[index],
      }))
    );

    return buttons;
  }
}
