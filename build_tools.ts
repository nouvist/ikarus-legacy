import * as fs from "node:fs";
import * as path from "node:path";

export function traverse(name: string, set?: Set<string>) {
  set ??= new Set<string>();
  if (set.has(name)) return set;
  set.add(name);
  const file = path.join(__dirname, "node_modules", name, "package.json");
  if (!fs.existsSync(file)) return set;
  const json = JSON.parse(fs.readFileSync(file, "utf-8"));
  [
    ...Object.keys(json.dependencies || {}),
    ...Object.keys(json.peerDependencies || {}),
    ...Object.keys(json.optionalDependencies || {}),
  ].forEach((dep) => traverse(dep, set));
  return set;
}

export function namespaces(deps: string[]): string[] {
  const set = new Set<string>();

  for (const dep of deps) {
    if (!dep.startsWith("@")) continue;
    if (dep.includes("/")) set.add(dep.split("/")[0]);
    else set.add(dep);
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

let _requireds: string[] | undefined;
export function requireds(): string[] {
  if (_requireds) return _requireds;
  const set = new Set<string>();

  for (const dep of externals) {
    traverse(dep, set);
  }

  for (const dep of set) {
    if (dep.startsWith("@types/")) set.delete(dep);
  }

  return (_requireds = Array.from(set).sort((a, b) => a.localeCompare(b)));
}

let _requiredsWithNamespaces: string[] | undefined;
export function requiredsWithNamespaces(): string[] {
  if (_requiredsWithNamespaces) return _requiredsWithNamespaces;
  const arr1 = requireds();
  const arr2 = namespaces(arr1);
  return (_requiredsWithNamespaces = [...arr2, ...arr1]);
}

export const externals = [
  "natural",
  "@lancedb/lancedb",
  "@lancedb/lancedb-darwin-x64",
  "@lancedb/lancedb-darwin-arm64",
  "@lancedb/lancedb-linux-x64-gnu",
  "@lancedb/lancedb-linux-arm64-gnu",
  "@lancedb/lancedb-linux-x64-musl",
  "@lancedb/lancedb-linux-arm64-musl",
  "@lancedb/lancedb-win32-x64-msvc",
  "@lancedb/lancedb-win32-arm64-msvc",
];

if (require.main === module) {
  for (const line of requiredsWithNamespaces()) {
    console.log(`- ${line}`);
  }
}
