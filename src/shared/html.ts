import fnv from "fnv-plus";

export abstract class HtmlUtils {
  static getSelectorFromElement(el: Element, includeClasses = true): string {
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

    return `${HtmlUtils.getSelectorFromElement(parent, false)} > ${current}:nth-child(${index})`;
  }

  static isParentOf(child: Element, parent: Element): boolean {
    if (parent === child) return true;
    if (!child.parentElement) return false;
    return HtmlUtils.isParentOf(child.parentElement, parent);
  }

  static getHashFromElement(el: Element) {
    return fnv.fast1a32(el.outerHTML);
  }
}
