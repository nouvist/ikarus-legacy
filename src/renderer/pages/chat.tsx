import Browser, { useBrowserController } from "~/renderer/components/browser";
import Card from "~/renderer/components/card";
import Chat, { useChatController } from "~/renderer/components/chat";
import Split from "~/renderer/components/split";

export default function ChatPage() {
  const browser = useBrowserController();
  const chat = useChatController(browser);

  return (
    <Card.Full>
      <Split>
        <Chat controller={chat} />
        <Browser controller={browser} />
      </Split>
    </Card.Full>
  );
}
