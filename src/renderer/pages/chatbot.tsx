import { WebviewTag } from "electron";
import { useRef } from "react";
import Split from "~/renderer/components/split";

export default function Chatbot() {
  const wv = useRef<WebviewTag>(null);
  return (
    <Split>
      <div>chatbot</div>
      <webview ref={wv} src="https://github.com" style={{ height: "100%" }} />
    </Split>
  );
}
