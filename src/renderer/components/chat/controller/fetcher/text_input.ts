import { BrowserController } from "~/renderer/components/browser";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { TextInputDataType } from "~/renderer/memory/tables/text_input";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

export default class TextInputFetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;

  static _validTypes = [
    "text",
    "password",
    "email",
    "number",
    "tel",
    "url",
    "search",
    "date",
    "time",
    "datetime-local",
    "month",
    "week",
  ];

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    this.findTextInput = this.findTextInput.bind(this);
    this.fetchTextInputs = this.fetchTextInputs.bind(this);
  }

  async findTextInput(semantics: string, limit = 10) {
    const embedding = await this._runner.embed(semantics);
    return this._memory.textInputs.findNearestTo(embedding, limit);
  }

  async fetchTextInputs(abortSignal?: AbortSignal) {
    const dom = await this._browser.value.dom();
    const inputs = Array.from(dom.querySelectorAll("input, textarea"))
      .filter((el) => {
        const value = el.getAttribute("hidden");
        return value === "false" || !value;
      })
      .filter((el) => el.getAttribute("type") !== "hidden")
      .filter((el) => {
        const type = el.getAttribute("type");
        if (!type) return true;
        return TextInputFetcher._validTypes.includes(type.toLowerCase());
      })
      .map((element) => {
        const selector = HtmlUtils.getElementSelector(element);
        const hash = HtmlUtils.getHashFromElement(element);
        const placeholder = element.getAttribute("placeholder") || "";
        let label = element.getAttribute("aria-label") || undefined;

        let parent = element.parentElement;
        while (!label && parent && parent.tagName !== "BODY") {
          if (parent.tagName === "LABEL") {
            label = parent.textContent?.trim() || undefined;
            break;
          }
          parent = parent.parentElement;
        }

        if (!label) {
          const labelElement = dom.querySelector(`label[for="${element.id}"]`);
          if (labelElement) {
            label = labelElement.textContent?.trim() || undefined;
          }
        }

        return {
          tag:
            element.tagName.toLowerCase() === "textarea"
              ? TextInputDataType.TextArea
              : TextInputDataType.Input,
          type: element.getAttribute("type") || undefined,
          label,
          id: element.id || undefined,
          name: element.getAttribute("name") || undefined,
          placeholder,
          hash,
          selector,
        };
      })
      .sort((a, b) => a.selector.localeCompare(b.selector));
    if (abortSignal?.aborted) return;
    console.log(`[Fetcher::fetchTextInputs] nemu ${inputs.length}`);

    let existings = await this._memory.textInputs.getAll();
    let removed = 0;
    for (const cursor of existings) {
      if (abortSignal?.aborted) break;
      if (inputs.some((input) => input.hash === cursor.hash)) continue;
      await this._memory.textInputs.remove(cursor.hash);
      removed++;
    }
    console.log(`[Fetcher::fetchTextInputs] ada ${removed} dari db`);
    console.log(`[Fetcher::fetchTextInputs] hapus ${removed} dari db`);

    for (let i = 0; i < inputs.length; i++) {
      const cursor = inputs[i];
      if (!existings.some((input) => input.hash === cursor.hash)) continue;
      inputs.splice(i, 1);
      i--;
    }

    if (abortSignal?.aborted) return;
    if (inputs.length === 0) {
      console.log("[Fetcher::fetchTextInputs] gak ada yang baru");
      return;
    }

    console.log(`[Fetcher::fetchTextInputs] embedding...`);
    const embeddings = await this._runner.embedMany(
      inputs.map((input) =>
        [
          input.label,
          input.name,
          input.id !== input.name ? input.id : undefined,
          input.placeholder,
        ]
          .filter(Boolean)
          .join("\n")
      ),
      abortSignal
    );

    console.log(`[Fetcher::fetchTextInputs] nambahin...`);
    await this._memory.textInputs.add(
      inputs.map((input, index) => ({
        ...input,
        embedding: embeddings[index],
      }))
    );

    return inputs;
  }
}
