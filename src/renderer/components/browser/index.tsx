import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
  LockClosed24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { DidNavigateEvent, DidNavigateInPageEvent, WebviewTag } from "electron";
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import { BrowserController } from "~/renderer/components/browser/controller";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import Constraints from "~/renderer/foundations/constraints";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import { bindRefs } from "~/shared/react";

export * from "~/renderer/components/browser/controller";

export interface BrowserProps {
  controller: BrowserController;
}

export default forwardRef(Browser);
function Browser({ controller }: BrowserProps, ref: ForwardedRef<WebviewTag>) {
  function expose(wv: WebviewTag) {
    Object.assign(window, {
      webview: wv,
    });
  }

  return (
    <Flex direction="column">
      <Controls controller={controller} />
      <webview
        ref={bindRefs(ref, controller?.bind, expose)}
        style={{ flex: 1 }}
        preload={Managed.webview.preload}
      />
    </Flex>
  );
}

function Controls({ controller }: { controller: BrowserController }) {
  const currentUrl = useRef("");
  const [url, setUrl] = useState("");
  const [canGoBack, setCanGoBack] = useState(true);
  const [canGoForward, setCanGoForward] = useState(true);

  useEffect(() => {
    function handleNavigate(event: DidNavigateEvent | DidNavigateInPageEvent) {
      setUrl((currentUrl.current = event.url));
    }

    (async () => {
      await controller.waitUntilReady();
      controller.load("https://google.com");
      const wv = controller.getRaw()!;
      wv.addEventListener("did-navigate", handleNavigate);
      wv.addEventListener("did-navigate-in-page", handleNavigate);
      Object.defineProperty(window, "__currentWebview", {
        value: controller,
      });
    })();

    return () => {
      const wv = controller.getRaw()!;
      if (!wv) return;
      wv.removeEventListener("did-navigate", handleNavigate);
      wv.removeEventListener("did-navigate-in-page", handleNavigate);
    };
  }, [controller]);

  return (
    <Card padding={EdgeInsets.all(16)} border={EdgeFlags.bottom}>
      <Flex gap={8}>
        <Button
          padding={EdgeInsets.zero}
          constraints={Constraints.all(40)}
          disabled={!canGoBack}
          onClick={controller.goBack}
        >
          <ChevronLeft24Regular />
        </Button>
        <Button
          padding={EdgeInsets.zero}
          constraints={Constraints.all(40)}
          disabled={!canGoForward}
          onClick={controller.goForward}
        >
          <ChevronRight24Regular />
        </Button>

        <Flex.Fill>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") controller.load(url);
              if (e.key === "Escape") setUrl(currentUrl.current);
            }}
            icon={
              currentUrl.current.startsWith("https") ? (
                <LockClosed24Regular />
              ) : (
                <Warning24Regular />
              )
            }
          />
        </Flex.Fill>
      </Flex>
    </Card>
  );
}
