import fnv from "fnv-plus";
import { BrowserController } from "~/renderer/components/browser";
import FetcherDefaults from "~/renderer/components/chat/controller/fetcher/defaults";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import {
  CheckboxInputClusterData,
  CheckboxInputData,
} from "~/renderer/memory/tables/checkbox_input";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

interface _CheckboxInputCluster {
  name: string;
  options: _CheckboxInput[];
}

interface _CheckboxInput {
  selector: string;
  hash: string;
  value: string;
  text: string;
  labels: string[];
  raw: HTMLInputElement;
}

interface _CheckboxInputWithSemantics extends _CheckboxInput {
  semantics: number[];
}

interface _CheckboxInputClusterWithSemantics extends _CheckboxInputCluster {
  semantics: number[];
  options: _CheckboxInputWithSemantics[];
}

export default class CheckboxInputFetcher {
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

  async findElementsByName(name: string): Promise<CheckboxInputData[]> {
    await this.fetchIfNeeded();
    return this._memory.checkboxInputs.findByName(name);
  }

  async findElementsBySemantics(
    selector: string,
    limit = FetcherDefaults.limit
  ): Promise<CheckboxInputData[]> {
    await this.fetchIfNeeded();
    const embedding = await this._runner.embed(selector);
    return this._memory.checkboxInputs.findNearestTo(embedding, limit);
  }

  async findClusterByName(
    name: string
  ): Promise<CheckboxInputClusterData | undefined> {
    await this.fetchIfNeeded();
    return this._memory.checkboxInputClusters.findByName(name);
  }

  async findClustersBySemantics(
    semantics: number[],
    limit = FetcherDefaults.limit
  ): Promise<CheckboxInputClusterData[]> {
    await this.fetchIfNeeded();
    return this._memory.checkboxInputClusters.findNearestTo(semantics, limit);
  }

  async fetch(dom?: Document): Promise<_CheckboxInputClusterWithSemantics[]> {
    dom ??= await this._browser.value.dom();
    const inputs = await this._collectClusters(dom);
    const applied = await this._applySemantics(inputs);
    console.log(`[CheckboxInputFetcher] ${inputs.length} clusters`);
    // console.log(`[CheckboxInputFetcher] saving clusters`);
    // await this._storeClusters(applied);
    console.log(`[CheckboxInputFetcher] saving checkbox inputs`);
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

  async _collectClusters(dom: Document): Promise<_CheckboxInputCluster[]> {
    const clusters = new Map<string, _CheckboxInputCluster>();
    const inputs = dom.querySelectorAll<HTMLInputElement>(
      "input[type='checkbox']"
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

  async _applySemantics(groups: _CheckboxInputCluster[]) {
    const applied: _CheckboxInputClusterWithSemantics[] = [];

    for (const group of groups) {
      const appliedOptions: _CheckboxInputWithSemantics[] = [];
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

  async _storeClusters(clusters: _CheckboxInputClusterWithSemantics[]) {
    await this._memory.checkboxInputClusters.clear();
    await this._memory.checkboxInputClusters.add(
      clusters.map((cluster) => ({
        name: cluster.name,
        options: cluster.options.length,
        semantics: cluster.semantics,
      }))
    );
  }

  async _storeInputs(clusters: _CheckboxInputClusterWithSemantics[]) {
    await this._memory.checkboxInputs.clear();
    await this._memory.checkboxInputs.add(
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
