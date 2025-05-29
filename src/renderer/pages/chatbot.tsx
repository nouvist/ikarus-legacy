import Browser, { useBrowserController } from "~/renderer/components/browser";
import Card from "~/renderer/components/card";
import Split from "~/renderer/components/split";

export default function Chatbot() {
  const wv = useBrowserController();
  return (
    <Card.Full>
      <Split>
        <div onClick={() => wv.load("https://github.com")}>Chatbot</div>
        <Browser controller={wv} />
      </Split>
    </Card.Full>
  );
}
