import Browser, { useBrowserController } from "~/renderer/components/browser";
import Card from "~/renderer/components/card";
import Chat from "~/renderer/components/chat";
import Split from "~/renderer/components/split";

export default function ChatPage() {
  const wv = useBrowserController();

  return (
    <Card.Full>
      <Split>
        <Chat>
          <Chat.User>
            Kerja yang sangat baik, tuan SpongeBob. Dan untuk membalasnya, kau
            diterima.
          </Chat.User>
          <Chat.Assistent>Tapi Tuan Krabs.</Chat.Assistent>
          <Chat.User>Tiga kali bersorak untuk SpongeBob. Yip yip!</Chat.User>
          <Chat.Assistent>Hore. Tuan Krabs...</Chat.Assistent>
          <Chat.User>
            Aku akan ada di kantorku untuk menghitung uangku.
          </Chat.User>
        </Chat>
        <Browser controller={wv} />
      </Split>
    </Card.Full>
  );
}
