import { Fragment } from "react/jsx-runtime";
import Browser, { useBrowserController } from "~/renderer/components/browser";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import Split from "~/renderer/components/split";
import { ColorType } from "~/renderer/foundations/colors";

export default function Chatbot() {
  const wv = useBrowserController();
  return (
    <Card.Full>
      <Split>
        <Fragment>
          <Button
            color={ColorType.primary}
            onClick={() => wv.load("https://istn.ac.id/")}
          >
            Go to ISTN
          </Button>
          <Button
            color={ColorType.danger}
            onClick={() => wv.load("https://github.com")}
          >
            Go to Github
          </Button>
        </Fragment>
        <Browser controller={wv} />
      </Split>
    </Card.Full>
  );
}
