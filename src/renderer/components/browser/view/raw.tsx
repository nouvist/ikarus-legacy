import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
  LockClosed24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { DidNavigateEvent, DidNavigateInPageEvent, WebviewTag } from "electron";
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { BrowserController } from "~/renderer/components/browser";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Flex, {
  AlignItems,
  FlexDirection,
  JustifyContent,
} from "~/renderer/components/flex";
import Input from "~/renderer/components/input";
import Stack from "~/renderer/components/stack";
import Constraints from "~/renderer/foundations/constraints";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import { bindRefs } from "~/shared/react";

export * from "~/renderer/components/browser/controller";

export interface BrowserProps {
  controller: BrowserController;
}

export default forwardRef(function Browser(
  { controller }: BrowserProps,
  ref: ForwardedRef<WebviewTag>
) {
  return (
    <Flex fill direction={FlexDirection.Column}>
      <_Controls controller={controller} />
      <Stack>
        <Stack.Fill>
          <webview
            ref={bindRefs(ref, controller?.bind)}
            style={{ width: "100%", height: "100%" }}
            preload={managed.webview.preload}
          />
        </Stack.Fill>
        <_Blank controller={controller} />
      </Stack>
    </Flex>
  );
});

function _Blank({ controller }: { controller: BrowserController }) {
  const last = useRef(true);
  const [isBlank, setIsBlank] = useState(last.current);

  useEffect(() => {
    const wv = controller.raw;
    if (!wv) return;

    function handleDidNavigate() {
      console.log("did-navigate", controller.location());
      const next = controller.location() === "";
      last.current = next;
      setIsBlank(next);
    }

    wv.addEventListener("did-navigate", handleDidNavigate);
    wv.addEventListener("did-navigate-in-page", handleDidNavigate);

    return () => {
      wv.removeEventListener("did-navigate", handleDidNavigate);
      wv.removeEventListener("did-navigate-in-page", handleDidNavigate);
    };
  }, [controller]);

  return (
    <Stack.Fill hidden={!isBlank}>
      <Flex
        fill
        direction={FlexDirection.Column}
        justifyContent={JustifyContent.Center}
        alignItems={AlignItems.Center}
      >
        <Card.Constrained
          margin={EdgeInsets.all(16)}
          constraints={new Constraints({ maxWidth: 320 })}
        >
          <h2>Start Browsing</h2>
          <p>Enter a URL or ask in the chat to start browsing the web.</p>
        </Card.Constrained>
      </Flex>
    </Stack.Fill>
  );
}

function _Controls({ controller }: { controller: BrowserController }) {
  const theme = useTheme();
  const currentUrl = useRef("");
  const [url, setUrl] = useState("");
  const [canGoBack, setCanGoBack] = useState(true);
  const [canGoForward, setCanGoForward] = useState(true);

  useEffect(() => {
    function handleNavigate(event: DidNavigateEvent | DidNavigateInPageEvent) {
      setUrl((currentUrl.current = event.url));
      setCanGoBack(controller.canGoBack());
      setCanGoForward(controller.canGoForward());
    }

    (async () => {
      await controller.waitUntilBound();
      const wv = controller.raw!;
      wv.addEventListener("did-navigate", handleNavigate);
      wv.addEventListener("did-navigate-in-page", handleNavigate);
      Object.defineProperty(window, "wv", {
        value: controller,
      });
    })();

    return () => {
      const wv = controller.raw;
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
              if (e.key === "Enter") controller.go(url);
              if (e.key === "Escape") setUrl(currentUrl.current);
            }}
            icon={
              currentUrl.current ===
              "" ? undefined : currentUrl.current.startsWith("https") ? (
                <LockClosed24Regular />
              ) : (
                <Warning24Regular color={theme.accent.danger} />
              )
            }
          />
        </Flex.Fill>
      </Flex>
    </Card>
  );
}
