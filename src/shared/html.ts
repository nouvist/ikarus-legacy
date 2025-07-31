import fnv from "fnv-plus";
import natural from "~/renderer/node/natural";

export abstract class HtmlUtils {
  static getElementSelector(el: Element, includeClasses = true): string {
    let current = el.tagName.toLowerCase();
    const id = el.id.trim();
    if (id) current += `#${CSS.escape(id)}`;

    if (includeClasses && el.classList.length > 0) {
      const classes = Array.from(el.classList)
        .map((cls) => CSS.escape(cls.trim()))
        .filter(Boolean);
      current += `.${classes.join(".")}`;
    }

    if (el.tagName === "INPUT" && el.hasAttribute("type")) {
      current += `[type="${CSS.escape(el.getAttribute("type")!)}"]`;
    }

    if (!el.parentElement) return current;
    const parent = el.parentElement!;
    const index = Array.from(el.parentElement!.children).indexOf(el) + 1;

    return `${HtmlUtils.getElementSelector(parent, false)} > ${current}:nth-child(${index})`;
  }

  static isParentOf(child: Element, parent: Element): boolean {
    if (parent === child) return true;
    if (!child.parentElement) return false;
    return HtmlUtils.isParentOf(child.parentElement, parent);
  }

  static getHashFromElement(element: Element | string): number {
    if (typeof element === "string") return fnv.fast1a32(element);
    return fnv.fast1a32(element.outerHTML);
  }

  static calculateSignatureSimilarity(a: string, b: string): number {
    const distance = natural.LevenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
  }

  static getElementSignature(element: Element, depth?: number): string {
    const tagName = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).sort().join(".");
    const childCount = element.children.length;
    const hasText = this.getElementMeaningfulText(element).length > 0;

    if (depth === undefined) {
      depth = 0;
      let parent = element.parentElement;
      while (parent && parent.tagName !== "BODY") {
        depth++;
        parent = parent.parentElement;
      }
    }

    const attrs = Array.from(element.attributes)
      .map((attr) => attr.name)
      .filter((name) => name !== "class" && name !== "id")
      .sort()
      .join(",");

    return [
      tagName,
      classes ? `.${classes}` : "",
      `[children=${childCount}]`,
      `[depth=${depth}]`,
      `[hasText=${hasText}]`,
      `[attrs=${attrs}]`,
    ].join("");
  }

  static getElementMeaningfulText(element: Element): string {
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent?.trim() + " ";
      }
    }

    if (element instanceof HTMLElement) {
      const alt = element.getAttribute("alt");
      const title = element.getAttribute("title");
      if (alt) text += alt + " ";
      if (title) text += title + " ";
    }

    return text.trim();
  }

  static isElementValid(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    if (element.tagName === "SCRIPT") return false;
    if (element.tagName === "STYLE") return false;
    return true;
  }
}
