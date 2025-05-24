import path from "path";

export default function createWebviewManaged() {
  return {
    preload: path.join(__dirname, "preload.js"),
  };
}
