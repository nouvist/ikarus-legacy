export default class PlatformManaged {
  readonly name = process.platform;
  readonly isWindows = process.platform === "win32";
  readonly isMac = process.platform === "darwin";
  readonly isLinux = process.platform === "linux";
}
