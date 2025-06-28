import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export default function SettingsPage() {
  return (
    <Card.Full padding={EdgeInsets.all(20)}>
      <Flex gap={8} direction={FlexDirection.Column}>
        <Button onClick={Managed.window.debug}>[Debug] Renderer</Button>
        <Button onClick={() => (window as any)["wv"]?.managed.debug()}>
          [Debug] Webview
        </Button>
      </Flex>
    </Card.Full>
  );
}
