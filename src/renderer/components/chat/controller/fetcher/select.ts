import fnv from "fnv-plus";
import { BrowserController } from "~/renderer/components/browser";
import FetcherDefaults from "~/renderer/components/chat/controller/fetcher/defaults";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { SelectData, SelectOptionData } from "~/renderer/memory/tables/select";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

interface _SelectCluster {
  hash: string;
  labels: string[];
  options: _SelectOption[];
  selector: string;
  raw: HTMLSelectElement;
}

interface _SelectOption {
  value: string;
  text: string;
  raw: HTMLOptionElement;
}

interface _SelectOptionWithSemantics extends _SelectOption {
  semantics: number[];
}

interface _SelectClusterWithSemantics extends _SelectCluster {
  semantics: number[];
  options: _SelectOptionWithSemantics[];
}

export default class SelectFetcher {
  protected _browser: RefCell<BrowserController>;
  protected _memory: InMemory;
  protected _runner: Runner;
  protected _last?: string;

  constructor(
    browser: RefCell<BrowserController>,
    memory: InMemory,
    runner: Runner
  ) {
    this._browser = browser;
    this._memory = memory;
    this._runner = runner;

    this.findElementsBySemantics = this.findElementsBySemantics.bind(this);

    this.fetch = this.fetch.bind(this);
    this.fetchIfNeeded = this.fetchIfNeeded.bind(this);

    this._collectClusters = this._collectClusters.bind(this);
    this._applySemantics = this._applySemantics.bind(this);
    this._storeSelects = this._storeSelects.bind(this);
  }

  async findElementsBySemantics(
    selector: string,
    limit = FetcherDefaults.limit
  ) {
    await this.fetchIfNeeded();
    const embedding = await this._runner.embed(selector);
    return this._memory.selects.findNearestTo(embedding, limit);
  }

  async fetch(dom?: Document): Promise<_SelectClusterWithSemantics[]> {
    dom ??= await this._browser.value.dom();
    const clusters = await this._collectClusters(dom);
    const applied = await this._applySemantics(clusters);
    // await this._storeClusters(applied);
    await this._storeSelects(applied);
    return applied;
  }

  async fetchIfNeeded(): Promise<void> {
    const dom = await this._browser.value.dom();
    const hash = fnv.hash(dom.body.outerHTML, 64).hex();
    if (this._last === hash) return;
    await this.fetch(dom);
    this._last = hash;
  }

  async _collectClusters(dom: Document): Promise<_SelectCluster[]> {
    const clusters = new Map<string, _SelectCluster>();
    const selects = dom.querySelectorAll<HTMLSelectElement>("select");

    for (const select of selects) {
      const hash = HtmlUtils.getHashFromElement(select);
      const labels = HtmlUtils.getLabelsFromElement(select);

      if (!clusters.has(hash)) {
        clusters.set(hash, {
          hash,
          labels,
          options: [],
          raw: select,
          selector: HtmlUtils.getElementSelector(select),
        });
      }

      const cluster = clusters.get(hash)!;

      for (const option of select.querySelectorAll<HTMLOptionElement>(
        "option"
      )) {
        cluster.options.push({
          value: option.value,
          text: option.textContent?.trim() || "",
          raw: option,
        });
      }
    }

    return Array.from(clusters.values());
  }

  async _applySemantics(groups: _SelectCluster[]) {
    const applied: _SelectClusterWithSemantics[] = [];

    for (const group of groups) {
      const appliedOptions: _SelectOptionWithSemantics[] = [];

      for (const option of group.options) {
        const semantics = await this._runner.embed(
          [option.value, option.text].join("\n")
        );
        appliedOptions.push({
          ...option,
          semantics: semantics || [],
        });
      }

      const semantics = await this._runner.embed(
        [
          group.labels.join(" "),
          group.options.map((group) => group.text).join(" "),
        ].join("\n")
      );
      applied.push({
        hash: group.hash,
        labels: group.labels,
        options: appliedOptions,
        semantics: semantics || [],
        selector: group.selector,
        raw: group.raw,
      });
    }

    return applied;
  }

  async _storeSelects(clusters: _SelectClusterWithSemantics[]) {
    await this._memory.selects.clear();
    await this._memory.selects.add(
      clusters.map(
        (cluster) =>
          ({
            hash: cluster.hash,
            embedding: cluster.semantics,
            labels: cluster.labels,
            selector: cluster.selector,
            options: cluster.options.map(
              (option) =>
                ({
                  text: option.text,
                  value: option.value,
                }) satisfies SelectOptionData
            ),
            raw: cluster.raw.outerHTML,
          }) satisfies SelectData
      )
    );
  }
}
