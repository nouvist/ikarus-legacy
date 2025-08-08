import fnv from "fnv-plus";
import { BrowserController } from "~/renderer/components/browser";
import FetcherDefaults from "~/renderer/components/chat/controller/fetcher/defaults";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import {
  RadioInputClusterData,
  RadioInputData,
} from "~/renderer/memory/tables/radio_input";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

interface _RadioInputCluster {
  name: string;
  options: _RadioInput[];
}

interface _RadioInput {
  selector: string;
  hash: string;
  value: string;
  text: string;
  labels: string[];
  raw: HTMLInputElement;
}

interface _RadioInputWithSemantics extends _RadioInput {
  semantics: number[];
}

interface _RadioInputClusterWithSemantics extends _RadioInputCluster {
  semantics: number[];
  options: _RadioInputWithSemantics[];
}

export default class RadioInputFetcher {
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

    this.findElementsByName = this.findElementsByName.bind(this);
    this.findElementsBySemantics = this.findElementsBySemantics.bind(this);
    this.findClusterByName = this.findClusterByName.bind(this);
    this.findClustersBySemantics = this.findClustersBySemantics.bind(this);

    this.fetch = this.fetch.bind(this);
    this.fetchIfNeeded = this.fetchIfNeeded.bind(this);

    this._collectClusters = this._collectClusters.bind(this);
    this._applySemantics = this._applySemantics.bind(this);
    this._storeClusters = this._storeClusters.bind(this);
    this._storeInputs = this._storeInputs.bind(this);
  }

  async findElementsByName(name: string): Promise<RadioInputData[]> {
    await this.fetchIfNeeded();
    return this._memory.radioInputs.findByName(name);
  }

  async findElementsBySemantics(
    selector: string,
    limit = FetcherDefaults.limit
  ): Promise<RadioInputData[]> {
    await this.fetchIfNeeded();
    const embedding = await this._runner.embed(selector);
    return this._memory.radioInputs.findNearestTo(embedding, limit);
  }

  async findClusterByName(
    name: string
  ): Promise<RadioInputClusterData | undefined> {
    await this.fetchIfNeeded();
    return this._memory.radioInputClusters.findByName(name);
  }

  async findClustersBySemantics(
    semantics: number[],
    limit = FetcherDefaults.limit
  ): Promise<RadioInputClusterData[]> {
    await this.fetchIfNeeded();
    return this._memory.radioInputClusters.findNearestTo(semantics, limit);
  }

  async fetch(dom?: Document): Promise<_RadioInputClusterWithSemantics[]> {
    dom ??= await this._browser.value.dom();
    const inputs = await this._collectClusters(dom);
    const applied = await this._applySemantics(inputs);
    console.log(`[RadioInputFetcher] ${inputs.length} kluwuester`);
    // console.log(`[RadioInputFetcher] menyimpan kluwuester`);
    // await this._storeClusters(applied);
    console.log(`[RadioInputFetcher] menyimpan radio uwu`);
    await this._storeInputs(applied);
    return applied;
  }

  async fetchIfNeeded(): Promise<void> {
    const dom = await this._browser.value.dom();
    const hash = fnv.hash(dom.body.outerHTML, 64).hex();
    if (this._last === hash) return;
    await this.fetch(dom);
    this._last = hash;
  }

  async _collectClusters(dom: Document): Promise<_RadioInputCluster[]> {
    const clusters = new Map<string, _RadioInputCluster>();
    const inputs = dom.querySelectorAll<HTMLInputElement>(
      "input[type='radio']"
    );

    for (const input of inputs) {
      const name = input.getAttribute("name");
      if (!name) continue;

      if (!clusters.has(name)) clusters.set(name, { name, options: [] });
      const cluster = clusters.get(name)!;
      cluster.options.push({
        selector: HtmlUtils.getElementSelector(input),
        hash: HtmlUtils.getHashFromElement(input),
        value: input.value,
        text: input.textContent?.trim() || "",
        labels: HtmlUtils.getElementLabels(input),
        raw: input,
      });
    }

    return Array.from(clusters.values());
  }

  async _applySemantics(groups: _RadioInputCluster[]) {
    const applied: _RadioInputClusterWithSemantics[] = [];

    for (const group of groups) {
      const appliedOptions: _RadioInputWithSemantics[] = [];
      const labels: string[] = [group.name];

      for (const option of group.options) {
        const semantics = await this._runner.embed(option.labels.join("\n"));
        labels.push(...option.labels);
        appliedOptions.push({
          ...option,
          semantics: semantics || [],
        });
      }

      const semantics = await this._runner.embed(labels.join("\n"));
      applied.push({
        name: group.name,
        options: appliedOptions,
        semantics: semantics || [],
      });
    }

    return applied;
  }

  async _storeClusters(clusters: _RadioInputClusterWithSemantics[]) {
    await this._memory.radioInputClusters.clear();
    await this._memory.radioInputClusters.add(
      clusters.map((cluster) => ({
        name: cluster.name,
        options: cluster.options.length,
        semantics: cluster.semantics,
      }))
    );
  }

  async _storeInputs(clusters: _RadioInputClusterWithSemantics[]) {
    await this._memory.radioInputs.clear();
    await this._memory.radioInputs.add(
      clusters.flatMap((cluster) =>
        cluster.options.map((option) => ({
          hash: option.hash,
          selector: option.selector,
          embedding: option.semantics,
          name: cluster.name,
          value: option.value,
          text: option.text,
          labels: option.labels,
          raw: option.raw.outerHTML,
        }))
      )
    );
  }
}
