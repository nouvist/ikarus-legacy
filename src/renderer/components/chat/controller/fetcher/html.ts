import fnv from "fnv-plus";
import { BrowserController } from "~/renderer/components/browser";
import Runner from "~/renderer/components/chat/controller/runner";
import InMemory from "~/renderer/memory";
import { HtmlData } from "~/renderer/memory/tables/html";
import natural from "~/renderer/node/natural";
import { RefCell } from "~/shared/core";
import { HtmlUtils } from "~/shared/html";

interface _Element {
  hash: string;
  signature: string;
  selector: string;
  raw: Element;
  text: string;
}

interface _ElementWithEmbedding extends _Element {
  embedding: number[];
}

interface _Cluster {
  hash: string;
  signature: string;
  elements: _ElementWithEmbedding[];
}

interface _ClusterWithKeywords extends _Cluster {
  keywords: string[];
}

export default class HtmlFetcher {
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

    this.findHtmlBySemantic = this.findHtmlBySemantic.bind(this);
    this.findHtmlsByCluster = this.findHtmlsByCluster.bind(this);
    this.findHtmlByClusterAndIndex = this.findHtmlByClusterAndIndex.bind(this);

    this.fetchHtmls = this.fetchHtmls.bind(this);
    this._store = this._store.bind(this);
    this._collectElements = this._collectElements.bind(this);
    this._applyEmbeddings = this._applyEmbeddings.bind(this);
    this._clusterElements = this._clusterElements.bind(this);
    this._mergeClusters = this._mergeClusters.bind(this);
    this._applyKeywords = this._applyKeywords.bind(this);
  }

  async findHtmlBySemantic(semantics: string, limit = 10) {
    await this.fetchHtmlsIfNeeded();
    const embedding = await this._runner.embed(semantics);
    return this._memory.html.findHtmlBySemantic(embedding, limit);
  }

  async findHtmlsByCluster(clusterHash: HtmlData["clusterHash"]) {
    await this.fetchHtmlsIfNeeded();
    return this._memory.html.findHtmlsByCluster(clusterHash);
  }

  async findHtmlByClusterAndIndex(
    clusterHash: HtmlData["clusterHash"],
    index: number
  ) {
    await this.fetchHtmlsIfNeeded();
    return this._memory.html.findHtmlByClusterAndIndex(clusterHash, index);
  }

  async fetchHtmlsIfNeeded() {
    const dom = await this._browser.value.dom();
    const hash = fnv.hash(dom.body.outerHTML, 64).hex();
    if (this._last === hash) return;
    this._last = hash;
    return this.fetchHtmls(dom);
  }

  async fetchHtmls(dom?: Document) {
    dom ??= await this._browser.value.dom();
    const elements = this._collectElements(dom.body);
    console.log(`[HtmlFetcher] ada ${elements.length} elemen jir wkwkwk`);
    const elementsWithEmbedding = await this._applyEmbeddings(elements);

    const clustered = this._clusterElements(elementsWithEmbedding);
    console.log(`[HtmlFetcher] ada ${clustered.length} kluwuster`);
    const merged = this._mergeClusters(clustered);
    console.log(`[HtmlFetcher] ada ${merged.length} wlee`);
    const clusterWithKeywords = this._applyKeywords(merged);

    await this._store(clusterWithKeywords);
    return clusterWithKeywords;
  }

  async _store(clusters: _ClusterWithKeywords[]) {
    this._memory.html.clear();
    for (const cluster of clusters) {
      await this._memory.html.add(
        cluster.elements.map((element, index) => ({
          hash: element.hash,
          signature: element.signature,
          selector: element.selector,
          html: element.raw.outerHTML,
          text: element.text,
          clusterHash: cluster.hash,
          clusterKeywords: cluster.keywords,
          clusterIndex: index,
          embedding: element.embedding,
        }))
      );
    }
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
          hash,
          signature,
          selector,
          raw,
          text,
        });
      }

      for (let i = 0; i < element.children.length; i++) {
        traverse(element.children[i], depth + 1);
      }
    }

    traverse(root);
    return elements;
  }

  private async _applyEmbeddings(
    elements: _Element[]
  ): Promise<_ElementWithEmbedding[]> {
    const embeddings = await this._runner.embedMany(
      elements.map((el) => el.text)
    );

    return elements.map((rest, index) => ({
      ...rest,
      embedding: embeddings[index],
    }));
  }

  private _clusterElements(elements: _ElementWithEmbedding[]): _Cluster[] {
    const map = new Map<string, _ElementWithEmbedding[]>();
    for (const element of elements) {
      if (!map.has(element.signature)) map.set(element.signature, []);
      map.get(element.signature)!.push(element);
    }

    const clusters = [] as _Cluster[];
    for (const [signature, elements] of map.entries()) {
      clusters.push({
        hash: fnv.hash(signature, 64).hex(),
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

  private _applyKeywords(clusters: _Cluster[]): _ClusterWithKeywords[] {
    const applied = [] as _ClusterWithKeywords[];
    const tokenizer = new natural.WordTokenizer();

    for (const cluster of clusters) {
      const texts = cluster.elements.map((el) => el.text);
      const allText = texts.join(" ");
      const tokens = tokenizer.tokenize(allText);
      const signature = cluster.signature;
      const hash = cluster.hash;

      const label = natural.NGrams.ngrams(tokens, 1)
        .map((n) => n.join(" "))
        .reduce(
          (acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

      const keywords = Object.entries(label)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry) => entry[0]);

      applied.push({
        hash,
        signature,
        elements: cluster.elements,
        keywords,
      });
    }

    return applied;
  }
}
