export default function createPlatformManaged() {
  return {
    name: process.platform,
    isWindows: process.platform === "win32",
    isMac: process.platform === "darwin",
    isLinux: process.platform === "linux",
  };
}
