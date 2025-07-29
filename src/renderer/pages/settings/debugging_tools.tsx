import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, { FlexDirection } from "~/renderer/components/flex";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export function SettingsPageDebuggingTools() {
  return (
    <Card.Full padding={EdgeInsets.all(32)}>
      <Flex direction={FlexDirection.Column} gap={16}>
        <Button onClick={managed.window.debug}>Debug Renderer</Button>
        <Button onClick={() => (window as any)["wv"]?.managed.debug()}>
          Debug Webview
        </Button>
      </Flex>
    </Card.Full>
  );
}
