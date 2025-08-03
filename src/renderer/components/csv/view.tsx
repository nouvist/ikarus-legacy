import { Delete24Regular } from "@fluentui/react-icons";
import { createPortal } from "react-dom";
import { useObservable } from "react-rx";
import { Fragment } from "react/jsx-runtime";
import styled from "styled-components";
import Button from "~/renderer/components/button";
import Card from "~/renderer/components/card";
import { CsvController } from "~/renderer/components/csv/controller";
import Flex, {
  AlignItems,
  FlexDirection,
  JustifyContent,
} from "~/renderer/components/flex";
import Overlay from "~/renderer/components/overlay";
import { ColorType } from "~/renderer/foundations/colors";
import Constraints from "~/renderer/foundations/constraints";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export interface CsvProps {
  controller: CsvController;
}

export default function Csv({ controller }: CsvProps) {
  const data = useObservable(controller.data);
  const drag = useObservable(controller.subject);

  return (
    <Fragment>
      {drag && <_DragOverlay />}
      {data && (
        <Card
          border={EdgeFlags.bottom}
          padding={EdgeInsets.symmetric({
            horizontal: 32,
            vertical: 16,
          })}
        >
          <Flex
            fill
            gap={8}
            justifyContent={JustifyContent.SpaceBetween}
            alignItems={AlignItems.Center}
          >
            <Flex direction={FlexDirection.Column}>
              <_Title>CSV Import</_Title>
              <div>{data.file.name}</div>
            </Flex>
            <Button
              color={ColorType.Danger}
              padding={EdgeInsets.zero}
              constraints={Constraints.all(40)}
              onClick={controller.clear}
            >
              <Delete24Regular />
            </Button>
          </Flex>
        </Card>
      )}
    </Fragment>
  );
}

const _Title = styled.div`
  font-weight: 600;
`;

function _DragOverlay() {
  return createPortal(
    <_Overlay>Drop your CSV file here to import.</_Overlay>,
    document.body
  );
}

const _Overlay = styled(Overlay)`
  user-select: none;
  pointer-events: none;
`;
