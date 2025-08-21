import { ComponentProps, PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { styled } from "styled-components";
import Card from "~/renderer/components/card";
import Overlay from "~/renderer/components/overlay";
import Constraints from "~/renderer/foundations/constraints";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export interface ModalProps extends PropsWithChildren {}

function Modal({ children }: ModalProps) {
  return createPortal(
    <Overlay>
      <Card.Constrained
        border={EdgeFlags.all}
        radius={8}
        padding={EdgeInsets.all(32)}
        constraints={Constraints.maxWidth(400)}
      >
        {children}
      </Card.Constrained>
    </Overlay>,
    document.body
  );
}

export interface ModalTitleProps extends ComponentProps<"h2"> {}

export interface ModalContentProps extends ComponentProps<"p"> {}

const _ModalTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 1.5em;
`;

const _ModalContent = styled.p`
  color: ${(p) => p.theme.foreground.e1};
`;

const _ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${(p) => p.theme.elevation.t3};
  gap: 16px;
`;

export default Object.assign(Modal, {
  Title: _ModalTitle,
  Content: _ModalContent,
  Buttons: _ModalButtonContainer,
});
