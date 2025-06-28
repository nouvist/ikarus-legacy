import { ComponentProps, ForwardedRef, forwardRef } from "react";
import styled, { css } from "styled-components";
import { ColorType } from "~/renderer/foundations/colors";
import Constraints from "~/renderer/foundations/constraints";
import EdgeInsets from "~/renderer/foundations/edge_insets";

export interface ButtonProps extends ComponentProps<"button"> {
  color?: ColorType;
  radius?: number;
  margin?: EdgeInsets;
  padding?: EdgeInsets;
  constraints?: Constraints;
}

export default forwardRef(Button);
function Button(
  {
    color,
    radius,
    margin,
    padding,
    constraints,
    children,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <_Button
      {...props}
      ref={ref}
      $color={color}
      $radius={radius}
      $margin={margin}
      $padding={padding ?? EdgeInsets.symmetric({ horizontal: 20 })}
      $constraints={constraints ?? new Constraints({ minHeight: 40 })}
    >
      {children}
    </_Button>
  );
}

interface _ButtonProps extends ComponentProps<"button"> {
  $color?: ColorType;
  $radius?: number;
  $margin?: EdgeInsets;
  $padding?: EdgeInsets;
  $constraints?: Constraints;
}
const _Button = styled.button<_ButtonProps>`
  position: relative;
  background: ${(p) =>
    p.$color ? p.theme.accent[p.$color] : p.theme.elevation.t2};
  color: ${(p) => p.theme.foreground.e0};
  box-shadow:
    inset 0 0 0 1px
      ${(p) => (p.color ? p.theme.elevation.t2 : p.theme.elevation.t1)},
    inset 0 -1px 0 0
      ${(p) => (p.color ? p.theme.elevation.t3 : p.theme.elevation.t2)};
  border-radius: ${(p) => p.$radius ?? 4}px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 200ms,
    border-color 200ms ease-in-out;
  margin: ${(p) => p.$margin?.toCssVariable() ?? "0px"};
  padding: ${(p) => p.$padding?.toCssVariable() ?? "0px"};
  ${(p) => p.$constraints?.toCss()}

  &:hover {
    background: ${(p) =>
      p.$color ? p.theme.accent[p.$color] : p.theme.elevation.t3};
    border-color: ${(p) =>
      p.$color ? p.theme.elevation.t3 : p.theme.elevation.t2};
  }

  ${(p) =>
    p.$color &&
    css`
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: none;
        transition:
          background-color 200ms,
          border-color 200ms ease-in-out;
      }
      &:not(:disabled):hover::before {
        background: ${(p) => p.theme.elevation.t2};
      }
    `}

  &:disabled {
    background: ${(p) => p.theme.elevation.t1};
    border-color: ${(p) => p.theme.elevation.t1};
    color: ${(p) => p.theme.foreground.e1};
  }
`;
