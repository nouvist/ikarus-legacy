import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import * as fs from "node:fs";
import * as path from "node:path";

function traverse(name: string, set?: Set<string>) {
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

let _requireds: string[] | undefined;
function requireds(): string[] {
  if (_requireds) return _requireds;
  const set = new Set<string>();
  const json = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  Object.keys(json.dependencies || {}).forEach((dep) => traverse(dep, set));
  return (_requireds = Array.from(set).sort((a, b) => a.localeCompare(b)));
}

if (require.main === module) {
  for (const name of requireds()) {
    console.log(`Required: ${name}`);
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    ignore: (path) => {
      if (path.startsWith("/.git")) return true;
      if (path.startsWith("/src")) return true;
      if (path.startsWith("/.vscode")) return true;
      if (path.startsWith("/.npmrc")) return true;
      if (path.endsWith(".ts")) return true;
      if (path === "/index.html") return true;
      if (path === "/tsconfig.json") return true;
      if (path === "/README.md") return true;

      return false;
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
        {
          entry: "src/webview/webview_preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
