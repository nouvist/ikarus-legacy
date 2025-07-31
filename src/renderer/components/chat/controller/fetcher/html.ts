import fnv from "fnv-plus";
import { BrowserController } from "~/renderer/components/browser";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

interface _Element {
  raw: Element;
  text: string;
  signature: string;
  selector: string;
  hash: number;
}

interface _Cluster {
  hash: number;
  signature: string;
  elements: _Element[];
}

interface _ClusterWithSemantic extends _Cluster {
  label: string;
}

export default class HtmlFetcher {
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

    this.fetchHtmls = this.fetchHtmls.bind(this);
    this._collectElements = this._collectElements.bind(this);
    this._clusterElements = this._clusterElements.bind(this);
    this._mergeClusters = this._mergeClusters.bind(this);
    this._applySemantic = this._applySemantic.bind(this);
  }

  async fetchHtmls() {
    const dom = await this._browser.value.dom();
    const elements = this._collectElements(dom.body);
    console.log(`[HtmlFetcher] ada ${elements.length} elemen jir wkwkwk`);
    const clustered = this._clusterElements(elements);
    console.log(`[HtmlFetcher] ada ${clustered.length} kluwuster`);
    const merged = this._mergeClusters(clustered);
    console.log(`[HtmlFetcher] ada ${merged.length} wlee`);
    const _applied = this._applySemantic(merged);
    return _applied;
  }

  private _collectElements(root: HTMLElement): _Element[] {
    const elements = [] as _Element[];
    const visited = new Set<Element>();

    async function traverse(element: Element, depth: number = 0) {
      if (visited.has(element)) return;
      if (!HtmlUtils.isElementValid(element)) return;
      visited.add(element);

      const text = HtmlUtils.getElementMeaningfulText(element);
      if (text.length > 10) {
        const raw = element;
        const signature = HtmlUtils.getElementSignature(element, depth);
        const selector = HtmlUtils.getElementSelector(element);
        const hash = HtmlUtils.getHashFromElement(element);

        elements.push({
          raw,
          text,
          signature,
          selector,
          hash,
        });
      }

      for (let i = 0; i < element.children.length; i++) {
        traverse(element.children[i], depth + 1);
      }
    }

    traverse(root);
    return elements;
  }

  private _clusterElements(elements: _Element[]): _Cluster[] {
    const map = new Map<string, _Element[]>();
    for (const element of elements) {
      if (!map.has(element.signature)) map.set(element.signature, []);
      map.get(element.signature)!.push(element);
    }

    const clusters = [] as _Cluster[];
    for (const [signature, elements] of map.entries()) {
      clusters.push({
        hash: fnv.fast1a32(signature),
        signature,
        elements,
      });
    }

    return clusters;
  }

  private _mergeClusters(clusters: _Cluster[]): _Cluster[] {
    const merged = [] as _Cluster[];
    const removed = new Set<number>();

    for (let i = 0; i < clusters.length; i++) {
      if (removed.has(i)) continue;
      const cursor = clusters[i];
      const similar = [cursor];

      for (let j = i + 1; j < clusters.length; j++) {
        const next = clusters[j];
        const similarity = HtmlUtils.calculateSignatureSimilarity(
          cursor.signature,
          next.signature
        );

        if (similarity > 0.8) {
          similar.push(next);
          removed.add(j);
        }
      }

      if (similar.length > 1) {
        const mergedElements = similar.flatMap((c) => c.elements);
        merged.push({
          hash: cursor.hash,
          signature: cursor.signature,
          elements: mergedElements,
        });
      } else {
        merged.push(cursor);
      }
    }

    return merged;
  }

  private _applySemantic(clusters: _Cluster[]): _ClusterWithSemantic[] {
    const applied = [] as _ClusterWithSemantic[];
    // TODO: bentar capek
    return clusters as _ClusterWithSemantic[];
  }
}
