import { useEffect } from "react";
import { useObservable } from "react-rx";
import Browser, {
  useBrowserController,
} from "~/renderer/components/browser/view/raw";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Chat, { useChatController } from "~/renderer/components/chat";
import TooManyRequestsController, {
  TooManyRequestsState,
} from "~/renderer/components/chat/controller/too_many_requests_controller";
import Csv, { useCsvController } from "~/renderer/components/csv";
import Flex, {
  FlexDirection
} from "~/renderer/components/flex";
import Modal from "~/renderer/components/modal";
import Split from "~/renderer/components/split";
import { ColorType } from "~/renderer/foundations/colors";

export default function ChatPage() {
  const csv = useCsvController();
  const browser = useBrowserController();
  const chat = useChatController(csv, browser);
  chat.ensureInitialized();

  useEffect(() => {
    Object.assign(window, {
      ExposedApi: {
        browser,
        chat,
      },
    });
  }, []);

  return (
    <Card.Full>
      <_TooManyRequests controller={chat.tooManyRequests} />
      <Split>
        <Flex fill direction={FlexDirection.Column}>
          <Chat controller={chat}>
            <Csv controller={csv} />
          </Chat>
        </Flex>
        <Browser controller={browser} />
      </Split>
    </Card.Full>
  );
}

function _TooManyRequests({
  controller,
}: {
  controller: TooManyRequestsController;
}) {
  const state = useObservable(controller.subject);
  if (state !== TooManyRequestsState.Ask) return null;
  return (
    <Modal>
      <Modal.Title>Too Many Requests</Modal.Title>
      <Modal.Content>
        You have exceeded the rate limit for requests. Please try again later.
      </Modal.Content>
      <Modal.Buttons>
        <Button onClick={controller.markAsAbort}>Abort</Button>
        <Button color={ColorType.Primary} onClick={controller.markAsRetry}>
          Retry
        </Button>
      </Modal.Buttons>
    </Modal>
  );
}
