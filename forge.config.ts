import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import * as fs from "node:fs";
import * as path from "node:path";

let _requireds: Set<string> | undefined;
function requireds() {
  if (_requireds) return _requireds;
  const results = new Set<string>();
  function traverse(name: string) {
    if (results.has(name)) return;
    results.add(name);
    const file = path.join(__dirname, "node_modules", name, "package.json");
    if (!fs.existsSync(file)) return;
    const json = JSON.parse(fs.readFileSync(file, "utf-8"));

    Object.keys(json.dependencies || {}).forEach(traverse);
    Object.keys(json.peerDependencies || {}).forEach(traverse);
    Object.keys(json.optionalDependencies || {}).forEach(traverse);
  }

  traverse("natural");
  traverse("@lancedb/lancedb");

  return (_requireds = results);
}

// for (const name of requireds()) {
//   console.log(`Required: ${name}`);
// }

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    ignore: (path) => {
      if (path.startsWith("/.git")) return true;
      if (path.startsWith("/src")) return true;
      if (path.startsWith("/.vscode")) return true;
      if (path.startsWith("/.npmrc")) return true;
      if (path.endsWith(".config.ts")) return true;
      if (path.endsWith(".d.ts")) return true;
      if (path.endsWith(".md")) return true;
      if (path === "/index.html") return true;
      if (path === "/tsconfig.json") return true;

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
