import { useEffect } from "react";

export default function removeSplash() {
  const root = document.getElementById("root");
  const splash = document.getElementById("splash");
  if (!root) return;
  if (!splash) return;
  root.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    fill: "forwards",
  }).onfinish = () => {
    root.removeAttribute("style");
    splash.remove();
  };
}

export function useRemoveSplash() {
  useEffect(removeSplash, []);
}
