export default function removeSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 200,
    fill: "forwards",
  }).onfinish = () => {
    splash.remove();
  };
}
