import Browser, { useBrowserController } from "~/renderer/components/browser";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Split from "~/renderer/components/split";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export default function Chatbot() {
  const wv = useBrowserController();
  return (
    <Card.Full>
      <Split>
        <Card padding={EdgeInsets.all(20)}>
          <Button onClick={wv.debug}>Debug</Button>
        </Card>
        <Browser controller={wv} />
      </Split>
    </Card.Full>
  );
}
