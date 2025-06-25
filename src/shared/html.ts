export function getSelector(el: HTMLElement): string {
  let current = el.tagName.toLowerCase();
  const id = el.id.trim();
  const cls = el.className
    .split(" ")
    .map((el) => el.trim())
    .filter((el) => el);
  if (id) current += el.id ? `#${el.id}` : "";
  for (const c of cls) {
    current += `.${c}`;
  }

  if (!el.parentElement) return current;
  const parent = el.parentElement!;
  const index = Array.from(el.parentElement!.children).indexOf(el) + 1;

  return `${getSelector(parent)} > ${current}:nth-child(${index})`;
}
