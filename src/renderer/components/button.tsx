import { ComponentProps } from "react";
import styled from "styled-components";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export interface ButtonProps extends ComponentProps<"button"> {
  radius?: number;
  margin?: EdgeInsets;
  padding?: EdgeInsets;
  constraints?: Constraints;
}

const Button = styled.button<ButtonProps>`
  background: ${(p) => p.theme.elevation.t2};
  color: ${(p) => p.theme.foreground.e0};
  border: 1px solid ${(p) => p.theme.elevation.t1};
  border-radius: ${(p) => p.radius ?? 4}px;
  margin: ${(p) => p.margin?.toCssVariable() ?? "0px"};
  padding: ${(p) => p.padding?.toCssVariable() ?? "0px"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 200ms,
    border-color 200ms ease-in-out;
  ${(p) => p.constraints?.toCss()}

  &:hover {
    background: ${(p) => p.theme.elevation.t3};
    border-color: ${(p) => p.theme.elevation.t2};
  }

  &:disabled {
    background: ${(p) => p.theme.elevation.t1};
    border-color: ${(p) => p.theme.elevation.t1};
    color: ${(p) => p.theme.foreground.e1};
  }
`;
export default Button;
