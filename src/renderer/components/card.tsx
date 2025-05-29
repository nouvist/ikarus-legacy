import { ComponentProps } from "react";
import styled, { css } from "styled-components";
import EdgeFlags from "~/renderer/foundations/edge_flags";
import {
  BackgroundColor,
  ElevationColor,
  ForegroundColor,
} from "~/renderer/foundations/colors";
import EdgeInsets from "~/renderer/foundations/edge_insets";
import Constraints from "~/renderer/foundations/constraints";

export interface CardProps extends ComponentProps<"div"> {
  background?: BackgroundColor;
  foreground?: ForegroundColor;
  radius?: number;
  border?: EdgeFlags;
  borderColor?: ElevationColor;
  margin?: EdgeInsets;
  padding?: EdgeInsets;
}

const Card = styled.div<CardProps>`
  background: ${(p) => p.theme.background[p.background ?? BackgroundColor.e0]};
  color: ${(p) => p.theme.foreground[p.foreground ?? ForegroundColor.e0]};
  border-radius: ${(p) => p.radius ?? 0}px;
  margin: ${(p) => p.margin?.toCssVariable() ?? "0px"};
  padding: ${(p) => p.padding?.toCssVariable() ?? "0px"};

  ${(p) =>
    p.border?.isLeft &&
    css`
      border-left: 1px solid
        ${p.theme.elevation[p.borderColor ?? ElevationColor.solid]};
    `}
  ${(p) =>
    p.border?.isRight &&
    css`
      border-right: 1px solid
        ${p.theme.elevation[p.borderColor ?? ElevationColor.solid]};
    `}
  ${(p) =>
    p.border?.isTop &&
    css`
      border-top: 1px solid
        ${p.theme.elevation[p.borderColor ?? ElevationColor.solid]};
    `}
  ${(p) =>
    p.border?.isBottom &&
    css`
      border-bottom: 1px solid
        ${p.theme.elevation[p.borderColor ?? ElevationColor.solid]};
    `}
`;

const CardFull = styled(Card)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

export interface CardConstrainedProps extends CardProps {
  constraints?: Constraints;
}

const CardConstrained = styled(Card)<CardConstrainedProps>`
  ${(p) => p.constraints?.toCss()}
`;

export default Object.assign(Card, {
  Full: CardFull,
  Constrained: CardConstrained,
});
