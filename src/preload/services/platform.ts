export default class PlatformManaged {
  readonly name = process.platform;
  readonly isWindows = process.platform === "win32";
  readonly isMac = process.platform === "darwin";
  readonly isLinux = process.platform === "linux";
  readonly isWindows11 = isWindows11();
}

function isWindows11() {
  const version = process.getSystemVersion().split(".").map(Number);
  if (process.platform !== "win32") return false;
  if (version[0] < 10) return false;
  if (version[2] < 22000) return false;
  return true;
}
